import { IconBadge } from "@/components/icon-badge"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChapterTitleForm } from "./_components/ChapterTitleForm"
import { ChapterDescriptionForm } from "./_components/ChapterDescriptionForm"
import { ChapterAccessForm } from "./_components/ChapterAccessForm"
import { ChapterVideoForm } from "./_components/ChapterVideoForm"
import { Banner } from "@/components/banner"
import { ChapterActions } from "./_components/ChapterActions"

const ChapterIdPage =async({params}:{params:{courseId:string,chapterId:string}}) => {

    const {userId} = auth()

    if(!userId){
        return redirect('/')
    }

    const chapter = await db.chapter.findUnique({
        where:{
            id:params.chapterId,
            courseId:params.courseId
        }
     
    });

    if(!chapter){
        return redirect('/')
    }

    const requiredFields = [
        chapter.title,
        chapter.description,
        chapter.videoUrl
    ]

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;
  
    const completionText = `(${completedFields}/${totalFields})`;
  
    const isComplete = requiredFields.every(Boolean);

  return (
    <>
    {!chapter.isPublished && (
        <Banner 
         variant="warning" 
         label="Chapter is not published. it will not be visibel in the course"
        />
    )}
    <div className='p-6'>
        <div className="flex items-center justify-between">
            <div className="w-full ">
                <Link 
                className="flex items-center text-sm hover:opacity-75 transition mb-6"
                href={`/teacher/courses/${params.courseId}`}>
                    <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back to course setup
                </Link>
                <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-2xl font-medium">
                        Chapter Creation
                        </h1>
                        <span className="text-sm text-slate-700">
                        Complete all fields {completionText}
                        </span>
                    </div>
                    <ChapterActions
                     disabled={!isComplete}
                     chapterId={chapter.id}
                     isPublished={chapter.isPublished}
                     courseId={params.courseId}
                      />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <div className="space-y-4">
                <div>
                    <div className="flex items-center gap-x-2">
                        <IconBadge icon={LayoutDashboard}/>
                        <h2 className="text-xl">
                            Customize your chapter
                        </h2>
                    </div>
                    <ChapterTitleForm 
                        chapterId={chapter.id}
                        initialData={chapter}
                        courseId={params.courseId}
                    />
                    <ChapterDescriptionForm 
                        chapterId={chapter.id}
                        initialData={chapter}
                        courseId={params.courseId}
                    />
                </div>
                <div>
                    <div className="flex items-center gap-x-2 ">
                        <IconBadge icon={Eye} />
                        <h2 className="text-xl">
                            Access Settings
                        </h2>
                    </div>
                    <ChapterAccessForm 
                     chapterId={chapter.id}
                     initialData={chapter}
                     courseId={params.courseId}
                    />
                </div>
            </div>
            <div>
                <div className="flex items-center gap-x-2">
                    <IconBadge icon={Video} />
                    <h2 className="text-xl">
                        Add a video
                    </h2>
                </div>
                <ChapterVideoForm
                    chapterId={chapter.id}
                    initialData={chapter}
                    courseId={params.courseId}
                />
            </div>
        </div>
     </div>
    </>
  )
}

export default ChapterIdPage