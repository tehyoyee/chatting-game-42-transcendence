COMPOSE	:=	docker-compose
UP_FLAGS:= --build

all:
	@$(MAKE) down &> /dev/null
	@$(MAKE) check
	@$(MAKE) up

up:
	$(COMPOSE) up $(UP_FLAGS)

check:
	@printf "DOCKER ---------------------------------------------------------\n\n"
	@bash tools/check_docker.sh
	@printf "\n.gitignore -----------------------------------------------------\n\n"
	@bash tools/check_gitignore.sh
	@printf "\n.env -----------------------------------------------------------\n\n"
	@bash tools/environment.sh
	@printf "\n----------------------------------------------------------------\n\n"

rmi:
	@docker image rm $(shell docker images -a -q)

rmc:
	@docker container rm $(shell docker ps -q -a)

stop:
	@printf "stoping containers...\n"
	@docker container stop $(shell docker ps -q -a)
	@printf "finished\n\n"

down:
	$(COMPOSE) down

.PHONY: all check rmi rmc stop down
