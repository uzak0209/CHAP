import { useContext } from "react";
import { createContext } from "vm";
import { Post } from "@/types/post";
import { Thread } from "@/types/thread";
interface NearContextProps{
    NearPostContext:Post[];
    NearThreadContext:Thread[];

}

const NearPostsContext=createContext();

