const CHAMBERS = [
    {
        chamber_id: "chamber-1",
        clinician_id: "doctor-1",
        hospital_name: "Ibn Sina Diagnostic and Consultation Center",
        room_no: "402",
        pad_config: {
            display_name: "Ibn Sina Diagnostic and Consultation Center, Dhanmondi",
            contact_lines: [
                { id: "l1", kind: "address", value: "House 12, Road 5, Dhanmondi, Dhaka 1205" },
                { id: "l2", kind: "phone", value: "01711-000000" },
                { id: "l3", kind: "hours", value: "Sat–Thu, 6:00 – 9:00 PM" },
                { id: "l4", kind: "custom", label: "Website", value: "www.ibnsinatrust.com" },
            ],
        },
    },
    {
        chamber_id: "chamber-2",
        clinician_id: "doctor-1",
        hospital_name: "Popular Diagnostic Centre",
        room_no: "12",
        pad_config: { display_name: "Popular Diagnostic Centre", paper: { mode: "preprinted", page_size: "legal" } },
    },
];

const data = (url: string) => {
    if (url.startsWith("/chamber")) return url === "/chamber" ? chambersForRun() : {};
    if (url.startsWith("/hospital")) return [{ hospital_id: "h1", name_en: "Square Hospital", district: "Dhaka" }];
    return {};
};

function chambersForRun() {
    return window.location.hash.includes("wizard") ? [] : CHAMBERS;
}

const api = {
    get:    async (url: string) => ({ data: data(url) }),
    post:   async () => ({ data: {} }),
    put:    async () => ({ data: {} }),
    delete: async () => ({ data: {} }),
};

export default api;
