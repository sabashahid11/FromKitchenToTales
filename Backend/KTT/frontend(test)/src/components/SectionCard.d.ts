import { PropsWithChildren, ReactNode } from "react";
interface SectionCardProps extends PropsWithChildren {
    title: string;
    description?: string;
    footer?: ReactNode;
}
export declare function SectionCard({ title, description, footer, children }: SectionCardProps): import("react/jsx-runtime").JSX.Element;
export {};
