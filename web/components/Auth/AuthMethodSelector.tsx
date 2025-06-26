import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

interface AuthMethodSelectorProps {
  value: 'invite' | 'sms';
  onChange: (method: 'invite' | 'sms') => void;
}

export function AuthMethodSelector({ value, onChange }: AuthMethodSelectorProps) {
  return (
    <div className="flex space-x-2">
      <MethodButton
        active={value === 'invite'}
        onClick={() => onChange('invite')}
      >
        招待コード
      </MethodButton>
      <MethodButton
        active={value === 'sms'}
        onClick={() => onChange('sms')}
      >
        <Smartphone className="w-4 h-4 mr-1" />
        SMS
      </MethodButton>
    </div>
  );
}

function MethodButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className="flex-1"
    >
      {children}
    </Button>
  );
} 