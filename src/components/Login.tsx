import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [rememberLogin, setRememberLogin] = useState(false);

  const handleGoogleLogin = () => {
    // TODO: AWS Cognito Google認証の実装
    // 現在はモック実装
    // ログイン状態保持の設定をlocalStorageに保存
    if (rememberLogin) {
      localStorage.setItem('rememberLogin', 'true');
    } else {
      localStorage.removeItem('rememberLogin');
    }
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
      {/* Login container */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Login button */}
        <button
          onClick={handleGoogleLogin}
          className="bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 rounded-xl shadow-lg px-8 py-4 flex items-center gap-4 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1/2 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:rounded-t-xl"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="white"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="white"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="white"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="white"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-gray-200 font-semibold text-lg">Google でログイン</span>
        </button>
        
        {/* Remember login checkbox */}
        <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberLogin}
            onChange={(e) => setRememberLogin(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">ログイン状態を保持する</span>
        </label>
      </div>
    </div>
  );
};

export default Login;