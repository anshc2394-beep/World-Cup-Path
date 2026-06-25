import { PredictionClient } from "@/components/PredictionClient";
export default async function PredictionPage({params}:{params:Promise<{predictionId:string}>}){const {predictionId}=await params;return <div className="shell py-10"><PredictionClient predictionId={predictionId}/></div>;}

