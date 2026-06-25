import { SimulatorApp } from "@/components/SimulatorApp";
export default async function GroupPage({params}:{params:Promise<{groupId:string}>}){const {groupId}=await params;return <SimulatorApp section="groups" initialGroup={groupId}/>;}

