import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      email,
      projectType,
      location,
      budget,
      date,
      time,
    } = body;

    const { data, error } = await resend.emails.send({
      from: "KS Constructions <onboarding@resend.dev>",

      // CHANGE THIS TO THE OWNER'S EMAIL
      to: ["vineshkodipaka04@gmail.com"],

      subject: `New Appointment - ${name}`,

      html: `
        <h2>New Construction Appointment</h2>

        <h3>Customer Details</h3>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>

        <hr />

        <h3>Project Details</h3>

        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Project Location:</strong> ${location}</p>
        <p><strong>Budget:</strong> ${budget}</p>

        <hr />

        <h3>Appointment</h3>

        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
      `,
    });

    if (error) {
      console.error(error);

      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send appointment.",
      },
      { status: 500 }
    );
  }
}