import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { acceptInvite, declineInvite, listMyInvites } from "@/lib/attendant-queue";
import { chamberLabel, type AttendantChamber } from "@/types/attendant-queue";
import { handleError } from "@/lib/utils";

export default function PendingInvites() {
    const queryClient = useQueryClient();
    const { data: invites = [] } = useQuery({ queryKey: ["my-invites"], queryFn: listMyInvites });

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["my-invites"] });
        queryClient.invalidateQueries({ queryKey: ["my-chambers"] });
    };

    const acceptMutation = useMutation({ mutationFn: acceptInvite, onSuccess: refresh, onError: (e) => handleError(e, "Could not accept") });
    const declineMutation = useMutation({ mutationFn: declineInvite, onSuccess: refresh, onError: (e) => handleError(e, "Could not decline") });

    if (invites.length === 0) return null;

    const doctorName = (invite: AttendantChamber) =>
        [invite.clinician_first_name, invite.clinician_last_name].filter(Boolean).join(" ");

    return (
        <div className="max-w-md mx-auto mb-6">
            <p className="text-sm font-medium mb-2">Invitations</p>
            {invites.map((invite) => (
                <div key={invite.chamber_id} className="border rounded-xl p-4 mb-2">
                    <p className="font-medium">Dr. {doctorName(invite)}</p>
                    <p className="text-sm text-muted-foreground mb-3">{chamberLabel(invite)}</p>
                    <div className="flex gap-2">
                        <Button
                            className="flex-1"
                            onClick={() => acceptMutation.mutate(invite.chamber_id)}
                            isLoading={acceptMutation.isPending}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => declineMutation.mutate(invite.chamber_id)}
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
