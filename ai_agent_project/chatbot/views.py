from rest_framework.decorators import api_view
from rest_framework.response import Response


# Make sure these imports match your actual file names!
from .services.llm import run_agent
from .services.vector_memory import add_to_vector_db, search_memory
from .services.memory import get_time 

@api_view(['POST'])
def chat(request):
    try:
        # Get data from React
        user_message = request.data.get('message')
        if not user_message:
            return Response({"response": "The input is empty, partner!"}, status=400)

        # Get current time (The watch)
        now = get_time()

        # Search past memories (The library)
        context = search_memory(user_message)

        # Build the prompt
        prompt = f"""
        [SYSTEM STATUS]
        CURRENT_TIME: {now}
        LOCATION: Bengaluru, India
        MODEL_ROLE: Real-time AI Agent
        
        [MEMORY CONTEXT]
        {context}

        [USER MESSAGE]
        {user_message}

        [INSTRUCTIONS]
        Use the CURRENT_TIME provided above to answer any questions about the date or time. 
        Do not use placeholders like '[insert date]'. Be direct and helpful.
        """

        # Ask the AI
        ai_response = run_agent(prompt)

        # Save memory
        add_to_vector_db("User", user_message)
        add_to_vector_db("AI", ai_response)

        return Response({"response": ai_response})

    except Exception as e:
        # This will print the REAL error in your terminal
        print(f"CRASH LOG: {str(e)}") 
        return Response({"response": f"Boss, the donkey tripped: {str(e)}"}, status=500)