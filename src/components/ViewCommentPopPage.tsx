'use client'

import { CommentType, RestaurantType, UserType } from "@/types/types";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Rating } from "@mui/material";
import { useRouter } from "next/navigation";
import { PencilLine, Trash2 } from "lucide-react";
import { AlertRemove } from "./AlertRemove";
import { useState } from "react";

 const ViewCommentPopPage = ({restaurants,user,closeCard}:{restaurants:RestaurantType,user: UserType,closeCard: () => void} ) => {
    const router = useRouter();
    console.log("user is",user)
    const [editing, setEditing] = useState(false);
    const [textVal, setTextVal] = useState("");
    const [starVal, setStarVal] = useState(0);
    const [curEditing, setCurEditing] = useState<string|null>(null);

    const resetStates = () => {
        setEditing(false);
        setTextVal("");
        setStarVal(0);
        setCurEditing(null);
    }

    const handleCreate = async (formData: FormData) => {
        
        try {
            const payload = {
                text: formData.get("comment"),
                rating: formData.get("rating"),
                user: user,
            }
            console.log(payload);
            const resp = await fetch(`/api/restaurants/${restaurants._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await resp.json();
            if(!resp.ok) {
                throw new Error(data.message || "Failed to create");
            }
            toast.success("Create success!", {position: 'top-center'})
            closeCard();
            router.refresh()

        } catch(err) {
            console.log(err);
            toast.error("Failed to create", {
                position: 'top-center',
                description: err instanceof Error ? err.message : "Something went wrong.",
            });
        }
    }

    const handleDeleteComment = async (id: string) => {
        try {
            const resp = await fetch(`/api/comments/${id}`, {
                method: 'DELETE',
            });
            
            const data = await resp.json();
            if(!resp.ok) {
                throw new Error(data.message || "Failed to delete");
            }
            toast.success("Create success!", {position: 'top-center'})
            router.refresh()

        } catch(err) {
            console.log(err);
            toast.error("Failed to delete", {
                position: 'top-center',
                description: err instanceof Error ? err.message : "Something went wrong.",
            });
        }
    }

    const handleSaveComment = async (formData: FormData) => {
        try {
            const payload = {
                text: formData.get("comment"),
                rating: formData.get("rating"),
                user: user,
            }
            if(!curEditing) {
                toast.error("No editing comment");
                return;
            }
            const resp = await fetch(`/api/comments/${curEditing}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await resp.json();
            if(!resp.ok) {
                throw new Error(data.message || "Failed to create");
            }
            toast.success("Save success!", {position: 'top-center'})
            closeCard();
            router.refresh()

        } catch(err) {
            console.log(err);
            toast.error("Failed to save", {
                position: 'top-center',
                description: err instanceof Error ? err.message : "Something went wrong.",
            });
        }
    }

    const handleSubmit = (formData: FormData) => {
        if(editing) handleSaveComment(formData);
        else handleCreate(formData);
    }

    const sortedComments = [...restaurants.comments].sort((a, b) => {
    const aIsMine = a.user._id === user._id ? 1 : 0;
    const bIsMine = b.user._id === user._id ? 1 : 0;

    return bIsMine - aIsMine;
    });

    console.log(restaurants.comments);
    return (
        <div className="z-50 fixed inset-0 bg-black/50 flex justify-center items-center h-dvh w-dvw">
            <form action={handleSubmit}>
                <div className="flex flex-col pt-12 px-15 pb-10 w-[1300px] h-[760px] bg-white rounded-md p-4 shadow font-bold">

                    <div className="flex justify-between ">
                        <div className="w-[100%] flex flex-col gap-5 [text-shadow:0_4px_20px_rgba(0,0,0,1)]  relative">
                            <h1 className="text-4xl ">Reviews</h1>
                            <h1 className="text-xl ">{user?.name}</h1>

                            <div className="flex flex-row gap-3 [text-shadow:0_4px_20px_rgba(0,0,0,1)] ">
                                <div className=" w-full flex flex-col items-end ">
                                    <input id='comment' name='comment' placeholder="Add Comment Here....." className="text-xl h-[40px] w-[100%] border-b border-gray-500" required 
                                        value={textVal}
                                        onChange={(e) => setTextVal(e.target.value)}
                                    />
                                    <h1 className="text-gray-500 w-fit ">0/500</h1>
                                </div>
                                <div className="flex flex-col gap-3 [text-shadow:0_4px_20px_rgba(0,0,0,1)] ">
                                    <Rating
                                        id='rating' name='rating'
                                        defaultValue={2.5} 
                                        sx={{
                                            zIndex: 2,
                                            fontSize: "3rem",
                                            
                                            "& .MuiRating-icon svg": {
                                            strokeWidth: 0.4,
                                            },

                                            "& .MuiRating-iconFilled svg": {
                                            fill: "url(#starGradient)",
                                            stroke: "black",
                                            },

                                            "& .MuiRating-iconEmpty svg": {
                                            fill: "transparent" ,
                                            stroke: "#333",
                                            },

                                            
                                        }}
                                        value={starVal}
                                        onChange={(e, nval) => setStarVal(nval || 0)}
                                        />
                                    <div className="flex gap-3">
                                        {editing && <Button variant={'ghost'} onClick={resetStates}
                                            className="h-full"
                                            type="button"
                                        >Cancel</Button>}
                                        <Button variant={'outline'} className="h-[50px] text-xl text-white [text-shadow:0_4px_20px_rgba(255,255,255,0.3)] flex-1 bg-black" type='submit'>Submit</Button>
                                    </div>
                                </div>
                            </div>
                            <Button variant={'destructive'} onClick={closeCard} className="absolute top-0 right-0">X</Button>
                        </div>
                    </div>

                    <div className="flex flex-1">

                        <div className="h-full flex flex-col  flex-7 gap-4 overflow-y-scroll">
                            {sortedComments.map((it: CommentType) => (
                                
                                <div key={it._id.toString()} className="flex flex-col !w-[96%] !overflow-visible border-b border-gray-500 pb-4 gap-2 overflow-scroll">
                                    <div className="flex flex-row gap-3">

                                        {user._id === it.user._id ? ( 

                                            <h1 className="text-blue-300">{it.user.name}</h1> 

                                            ) : (

                                            <h1 className="text-black">{it.user.name}</h1> 

                                            )}

                                        <Rating
                                        value={it.rating} 
                                        readOnly
                                        sx={{
                                            zIndex: 2,
                                            fontSize: "1.5rem",
                                            
                                            "& .MuiRating-icon svg": {
                                            strokeWidth: 0.4,
                                            },

                                            "& .MuiRating-iconFilled svg": {
                                            fill: "url(#starGradient)",
                                            stroke: "black",
                                            },

                                            "& .MuiRating-iconEmpty svg": {
                                            fill: "transparent" ,
                                            stroke: "#333",
                                            },
                                        }}
                                        />
                                        {(user && user._id===it.user._id) && (
                                            <>
                                                <Button type='button' variant={'ghost'} onClick={() => {
                                                    setEditing(true)
                                                    setTextVal(it.text)
                                                    setStarVal(it.rating);
                                                    setCurEditing(it._id.toString())
                                                }}><PencilLine/></Button>
                                            </>
                                        )}
                                        {user && (user._id===it.user._id || ['admin'].includes(user.role)) && (
                                            <AlertRemove
                                                title={'Remove Comment'}
                                                description={'This action cannot be undone. This will permanently delete this comment data from our servers.'}
                                                action={() => handleDeleteComment(it._id.toString())}
                                            >
                                                <Button variant={'destructive'}><Trash2/></Button>
                                            </AlertRemove>
                                        )}
                                    </div>
                                    <h1>{it.text}</h1>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col py-5 pl-9 pr-0 flex-3 gap-3">
                            <img src={restaurants.imgsrc} className=""/>
                            <h1 className="text-4xl text-center">{restaurants?.name}</h1>
                            <h1 className="text-xl text-center">Adress : {restaurants?.address} Tel : {restaurants.telephone}</h1>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    )
}

export {ViewCommentPopPage};