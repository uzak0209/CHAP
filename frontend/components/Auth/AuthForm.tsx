import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Smartphone } from 'lucide-react';

interface AuthFormProps {
  authMethod: 'invite' | 'sms';
  inviteCode: string;
  phoneNumber: string;
  loading: boolean;
  onInviteCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onLogin: () => void;
  onQRScan: () => void;
}

export function AuthForm({
  authMethod,
  inviteCode,
  phoneNumber,
  loading,
  onPhoneNumberChange,
  onLogin,
}: AuthFormProps) {
  return (
    <div className="space-y-4">
      {authMethod === 'sms' && (
        <SMSForm
          value={phoneNumber}
          onChange={onPhoneNumberChange}
        />
      )}
      
      <LoginButton
        loading={loading}
        disabled={!inviteCode && authMethod === 'invite' || !phoneNumber && authMethod === 'sms'}
        onClick={onLogin}
      />
    </div>
  );
}

function SMSForm({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor="phone">電話番号</Label>
      <Input
        id="phone"
        type="tel"
        placeholder="090-1234-5678"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function LoginButton({ 
  loading, 
  disabled, 
  onClick 
}: { 
  loading: boolean; 
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full"
    >
      {loading ? '認証中...' : 'ログイン'}
    </Button>
  );
} 