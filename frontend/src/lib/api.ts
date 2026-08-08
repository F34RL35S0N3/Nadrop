type StakeResult = {
  txHash?: string;
  error?: string;
};

type PaymentFetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
type StakeInput = {
  marketId: number;
  side: boolean;
  userAddress?: string;
};

function getRawError(value: unknown): string {
  if (value && typeof value === "object") {
    const error = value as { shortMessage?: string; message?: string; cause?: unknown };
    return error.shortMessage ?? error.message ?? getRawError(error.cause);
  }

  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function responseError(response: Response, body: Record<string, unknown>) {
  const message =
    typeof body.details === "string"
      ? body.details
      : typeof body.error === "string"
        ? body.error
        : JSON.stringify(body);

  return `HTTP ${response.status} ${response.statusText}: ${message}`;
}

export async function stake(
  input: StakeInput,
  fetchWithPayment?: PaymentFetch,
): Promise<StakeResult> {
  try {
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    };

    const firstResponse = await fetch("/api/stake", request);

    if (firstResponse.status === 402) {
      if (!fetchWithPayment) {
        const requirements = await readResponse(firstResponse);
        return {
          error: `HTTP 402 Payment Required: ${JSON.stringify(requirements)}`,
        };
      }

      const paidResponse = await fetchWithPayment("/api/stake", request);
      const paidBody = await readResponse(paidResponse);

      if (!paidResponse.ok) {
        return {
          error: responseError(paidResponse, paidBody),
        };
      }

      return { txHash: paidBody.txHash };
    }

    const body = await readResponse(firstResponse);

    if (!firstResponse.ok) {
      return {
        error: responseError(firstResponse, body),
      };
    }

    return { txHash: body.txHash };
  } catch (error) {
    return { error: getRawError(error) };
  }
}
