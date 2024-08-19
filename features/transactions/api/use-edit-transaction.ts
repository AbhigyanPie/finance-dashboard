import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { PATCH } from "@/app/api/[[...route]]/route";

// debugger;
type ResponseType = InferResponseType<typeof client.api.transactions[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.transactions[":id"]["$patch"]>["json"];

export const useEditTransaction = (id?: string) => {
    const queryClient = useQueryClient();
    // debugger;
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            try {
                const response = await client.api.transactions[":id"]["$patch"]({
                    json,
                    param: {id}
                });
                
                // Log the response to inspect it
                console.log('API response:', response);
                // console.log('error found is :', error);

                if (!response.ok) {
                    // Log the error response if it's not OK
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`Failed to update account: ${errorText}`);
                }

                return await response.json();
            } catch (error) {
                // Log the error for debugging purposes
                console.error('Error in mutation function:', error);
                throw error;
            }
        }, 
        onSuccess: (data) => {
            // Log the successful data for debugging purposes
            console.log('Transaction updated successfully:', data);
            toast.success("Transaction edited");
            queryClient.invalidateQueries({ queryKey: ["transaction",{id}] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        // onError: (error) => {
        //     // Log the error for debugging purposes
        //     console.error('Error in onError:', error);
        //     toast.error("Failed to edit transaction: ");
        // },
        onError: (error) => {
            console.error('Error in onError:', error);
            toast.error(`Failed to edit transaction: ${error.message}`);
        },
    });

    return mutation;
};
