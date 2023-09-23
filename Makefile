FRONT_PATH		= ./frontend/
BACK_PATH			= ./backend/chat-app/
FRONT_MODULE	= $(FRONT_PATH)node_module
BACK_MODULE		= $(BACK_PATH)node_module

IPADDR				= $(shell ifconfig | grep 'inet 10.' | cut -d ' ' -f 2 | head -n 1)

ifndef FILTER
FILTER				=
else
FILTER				= /dev/null
endif

all:
	$(MAKE) front FILTER="> /dev/null" #&
	$(MAKE) back FILTER="> /dev/null" #&

env:
	echo $(IPADDR)

front: $(FRONT_MODULE)
	cd $(FRONT_PATH) && npm run dev -- -p 3001 $(FILTER)

back: $(BACK_MODULE)
	cd $(BACK_PATH) && npm run start:dev $(FILTER)

$(FRONT_MODULE):
	cd $(FRONT_PATH) && npm i

$(BACK_MODULE):
	cd $(BACK_PATH) && npm i

#kill $(ps -o pid -o command | grep 'node\|npm\|next\|nest' | cut -d ' ' -f 1)
