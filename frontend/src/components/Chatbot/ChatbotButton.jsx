function ChatBotButton({ onClick }) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div 
        className="bg-purple-600 text-white p-5 rounded-full shadow-lg cursor-pointer hover:bg-purple-700 transition-colors animate-bounce flex flex-col items-center" 
        onClick={onClick}
      >
        <div className="flex items-center mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <span className="text-lg font-semibold">Besoin d'aide?</span>
        <span className="text-xs mt-1 text-purple-200">Cliquez-moi!</span>
      </div>
    </div>
  );
}

export default ChatBotButton;