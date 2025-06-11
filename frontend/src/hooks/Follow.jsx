import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../config";

const Follow = () => {
  const queryClient = useQueryClient();

  const { mutate: followUser, isPending } = useMutation({
    mutationFn: async (id) => {
      try {
        const ENDAPI = `${BACKEND_URL}/api/user/follow/${id}`;
        // console.log(id);
        // console.log(ENDAPI);
        const response = await fetch(ENDAPI, {
          credentials: "include",
        });
        // console.log(response);
        const data = await response.json();
        if (data.error) throw new Error(error.data);
        // console.log(data);
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Followed");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUser"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
    },
  });

  return { followUser, isPending };
};

export default Follow;
