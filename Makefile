FRONT_PATH		= ./frontend/
BACK_PATH			= ./backend/chat-app/
FRONT_MODULE	= $(FRONT_PATH)node_module
BACK_MODULE		= $(BACK_PATH)node_module

front: $(FRONT_MODULE)
	cd $(FRONT_PATH) && npm run dev -- -p 3001

back: $(BACK_MODULE)
	cd $(BACK_PATH) && npm run start:dev

$(FRONT_MODULE):
	cd $(FRONT_PATH) && npm i

$(BACK_MODULE):
	cd $(BACK_PATH) && npm i
