import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: { courseId: string, chapterId: string } }) {
  try {
    const { userId } = auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    })
    if (!ownCourse) return new NextResponse("Unauthorized", { status: 401 })

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      }
    })
    if (!chapter) return new NextResponse("Chapter not found", { status: 404 })

    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId
      }
    })

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      }
    })

    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: { id: params.courseId },
        data: { isPublished: false }
      })
    }

    return NextResponse.json(deletedChapter)

  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { courseId: string, chapterId: string } }) {
  try {
    const { userId } = auth()
    const { isPublished, ...values } = await req.json()

    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    })
    if (!ownCourse) return new NextResponse("Unauthorized", { status: 401 })

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId
      },
      data: {
        ...values,
      }
    })

    return NextResponse.json(chapter)

  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
