import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // First try the permanent Clerk → ProperT connection.
  let propertUser = await prisma.user.findUnique({
    where: {
      authProviderId: userId,
    },
  });

  if (!propertUser) {
    // First login: use the Clerk email to try to connect
    // this identity to an existing ProperT user.
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 }
      );
    }

    const primaryEmail =
      clerkUser.emailAddresses.find(
        (email) =>
          email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No email found for this account" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: primaryEmail,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "ProperT user not found",
          code: "PROPERT_USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Don't steal an account already connected to a
    // different Clerk identity.
    if (
      existingUser.authProviderId &&
      existingUser.authProviderId !== userId
    ) {
      return NextResponse.json(
        {
          error:
            "This ProperT account is already linked to another login.",
        },
        { status: 409 }
      );
    }

    propertUser = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        authProviderId: userId,
      },
    });
  }

  return NextResponse.json({
    user: {
      id: propertUser.id,
      firstName: propertUser.firstName,
      lastName: propertUser.lastName,
      email: propertUser.email,
      role: propertUser.role,
    },
  });
}