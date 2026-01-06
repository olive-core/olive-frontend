import { HospitalIcon, MailIcon, PhoneIcon } from "lucide-react";

export default function DoctorInfo() {
    return (
        <div className="pt-2">
            <h3 className="text-xl text-emerald-600 font-display">Doctor Name</h3>
            <p className="text-sm text-slate-500">MBBS, FCPS, Specialist</p>

            <p className="mt-2 text-md font-bold text-slate-700">
                Assistant Professor, Department of Cardiology
            </p>
            <p className="text-slate-600">
                <HospitalIcon className="inline-block w-4 h-4 mr-2" />
                XYZ Medical College and Hospital
            </p>

            <p className="text-slate-600">
                <MailIcon className="inline-block w-4 h-4 mr-2" />
                doctor@example.com
            </p>

            <p className="text-slate-600">
                <PhoneIcon className="inline-block w-4 h-4 mr-2" />
                01xxxxxxxxx
            </p>

            <p className="mt-2 text-slate-600">
                BMDC: <span className="font-semibold">123456</span>
            </p>
        </div>
    )
}