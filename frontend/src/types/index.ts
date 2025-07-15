export interface ExampleProps {
    title: string;
    isActive: boolean;
}

export interface AppState {
    count: number;
}

export type User = {
    id: number;
    name: string;
    email: string;
};