import { TeamClient } from "@/components/TeamClient";
export default async function TeamPage({params}:{params:Promise<{teamId:string}>}){const {teamId}=await params;return <div className="shell py-10"><TeamClient teamId={teamId}/></div>;}

