## Technology Stack

- **Backend**: NestJS with MongoDB
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Containerization**: Docker & Docker Compose

## Why Docker and Docker Compose?

### Docker Benefits
1. **Consistency**: 
   - Ensures the application runs the same way across all environments
   - Eliminates "it works on my machine" problems
   - Provides isolated environments for each service

2. **Portability**:
   - Easy deployment across different platforms
   - No need to install dependencies manually
   - Simplified environment setup

3. **Scalability**:
   - Easy to scale containers horizontally
   - Efficient resource utilization
   - Quick startup and shutdown

### Docker Compose Benefits
1. **Service Orchestration**:
   - Manages multiple containers as a single application
   - Defines relationships between services
   - Handles networking between containers automatically

2. **Configuration Management**:
   - Environment variables managed in one place
   - Volume mapping for persistent data
   - Easy to modify service configurations

3. **Development Workflow**:
   - Single command to start/stop all services
   - Easy to add/remove services
   - Simplified testing and debugging
68|## Requirements

- Docker
- Docker Compose

## Getting Started

### Running with Docker Compose

To start the entire application stack including the Todo API and the ELK Stack services, run:

```bash
$ docker-compose up --build -d
```

This command starts all services defined in the docker-compose.yml file in detached mode:
- Todo API service (NestJS application)
- Elasticsearch
- Logstash
- Kibana

To check the status of running containers:

```bash
$ docker-compose ps
```

To stop all services:

```bash
$ docker-compose down
```

## API Endpoints

### Create a Todo

```bash
$ curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Docker",
    "description": "Study Docker and Docker Compose"
  }'
```

### Get All Todos

```bash
$ curl -X GET http://localhost:3000/todos
```

### Get Todo by ID

```bash
$ curl -X GET http://localhost:3000/todos/123456789012
```

### Update a Todo

```bash
$ curl -X PUT http://localhost:3000/todos/123456789012 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Docker & Kubernetes",
    "description": "Study Docker, Docker Compose and Kubernetes",
    "completed": true
  }'
```

### Delete a Todo

```bash
$ curl -X DELETE http://localhost:3000/todos/123456789012
```

## Accessing the ELK Stack

Once all services are running, you can access the Kibana dashboard at:

```
http://localhost:5601/app/dashboards#/view/todo-dashboard
```


