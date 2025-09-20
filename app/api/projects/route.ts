import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/prisma";

// GET /api/projects - Get all projects for the authenticated user
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        projectData: true,
        originalImage: true,
        processedImage: true,
        finalImage: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, projectData, originalImage, processedImage, finalImage } = body;

    if (!name || !projectData) {
      return NextResponse.json(
        { message: "Name and project data are required" },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        name,
        description: description || null,
        userId: session.user.id,
        projectData,
        originalImage: originalImage || null,
        processedImage: processedImage || null,
        finalImage: finalImage || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        projectData: true,
        originalImage: true,
        processedImage: true,
        finalImage: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
