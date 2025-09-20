import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/prisma";

// GET /api/projects/[id] - Get a specific project
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const project = await db.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only access their own projects
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

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a specific project
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, projectData, originalImage, processedImage, finalImage } = body;

    // Check if project exists and belongs to user
    const existingProject = await db.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (projectData !== undefined) updateData.projectData = projectData;
    if (originalImage !== undefined) updateData.originalImage = originalImage;
    if (processedImage !== undefined) updateData.processedImage = processedImage;
    if (finalImage !== undefined) updateData.finalImage = finalImage;

    const project = await db.project.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a specific project
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if project exists and belongs to user
    const existingProject = await db.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    await db.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
