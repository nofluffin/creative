import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, signIn, signOut, clientId } = useAuth();

  if (!clientId) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={user.picture}
          alt=""
          className="w-8 h-8 rounded-full"
          referrerPolicy="no-referrer"
        />
        <span className="text-sm font-medium text-navy">{user.name}</span>
        <button
          onClick={signOut}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={(response) => signIn(response.credential)}
      onError={() => console.error('Sign in failed')}
      size="medium"
      theme="outline"
      text="signin_with"
    />
  );
}
