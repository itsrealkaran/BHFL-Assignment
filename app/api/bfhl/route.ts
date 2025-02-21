import { NextRequest, NextResponse } from 'next/server';

interface RequestData {
  data: string[];
}

interface SuccessResponse {
  is_success: true;
  user_id: string;
  email: string;
  roll_number: string;
  numbers: string[];
  alphabets: string[];
  highest_alphabet: string[];
}

interface ErrorResponse {
  is_success: false;
  error: string;
}

export async function GET() {
  return NextResponse.json({ operation_code: 1 });
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestData = await request.json();

    if (!body.data || !Array.isArray(body.data)) {
      return NextResponse.json<ErrorResponse>(
        { is_success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const numbers = body.data.filter(item => /^\d+$/.test(item));
    const alphabets = body.data.filter(item => /^[A-Za-z]$/.test(item));
    const highest_alphabet = alphabets.length > 0 
      ? [alphabets.reduce((a, b) => a.toLowerCase() > b.toLowerCase() ? a : b)]
      : [];

    const response: SuccessResponse = {
      is_success: true,
      user_id: "Karan_Singh_22BCS11220",
      email: "karansingh@duck.com",
      roll_number: "22BCS11220",
      numbers,
      alphabets,
      highest_alphabet
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { is_success: false, error: "Invalid input" },
      { status: 400 }
    );
  }
} 