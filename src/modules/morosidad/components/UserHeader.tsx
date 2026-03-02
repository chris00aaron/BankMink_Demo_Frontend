import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';

interface UserHeaderProps {
    userName?: string;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function UserHeader({ userName = 'Usuario', title, subtitle, actions }: UserHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    {title}
                </h1>
                {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
                {actions}
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">Gestor de Crédito</p>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-gray-50">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${userName}&background=random`} alt={userName} />
                        <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    );
}
