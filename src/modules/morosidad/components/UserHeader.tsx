import { Bell, Search, Settings } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/components/ui/tooltip';

interface UserHeaderProps {
    userName?: string;
    title: string;
    subtitle?: string;
}

export function UserHeader({ userName = 'Usuario', title, subtitle }: UserHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    {title}
                </h1>
                {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                                    <Search className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Searching</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </Button>

                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

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
