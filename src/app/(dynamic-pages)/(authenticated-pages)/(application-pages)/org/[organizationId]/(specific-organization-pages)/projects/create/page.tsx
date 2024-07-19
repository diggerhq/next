
import CreateProjectForm from "@/components/CreateProjectForm";
import { organizationParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Project",
    description: "Create a new project within your organization.",
};

export default async function CreateProjectPage({
    params,
}: {
    params: unknown;
}) {
    const { organizationId } = organizationParamSchema.parse(params);

    return (
        <div className="w-full mt-1">
            <CreateProjectForm organizationId={organizationId} />
        </div>
    );
}