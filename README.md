# Progetto TAASS 2024-2025

This application was developed as part of a university project aimed at designing and implementing a system based on microservice architecture.
MagicEvents is a platform designed to manage, create, and participate in events, offering a fully personalized and interactive user experience.
The implemented microservices include the following:

## User-management Service

This service supports two authentication mechanisms—Google OAuth and an internal authentication system. Session tokens are issued and stored in a database. An authentication filter is employed to validate the token with each request and, when necessary, automatically refresh expired tokens.

## Events-management Service

This is the core service of the system, responsible for providing users with full functionality to create events, cancel and reactivate them, modify their properties after creation, and ultimately delete them.

Event deletion is handled asynchronously. Each event maintains a status, which can be one of the following: "ACTIVE", "ANNULLED", or "DELETE".
When a user initiates the deletion of an event, the events-management service publishes a deletion message via RabbitMQ to all microservices that were registered as participants during the event’s creation. It then waits for an acknowledgment (ACK) from each of those services confirming successful deletion.
Only once all associated services have responded positively is the event instance itself permanently removed from the events-management service.

## Eventsetup Service

The eventsetup service acts as an orchestrator and is designed to be stateless. It is responsible for coordinating the creation of new events.
When a user initiates the event creation process, a request is sent to the eventsetup service, which in turn interacts with the events-management service and other microservices involved in the event lifecycle.

The SAGA pattern is simulated, executed synchronously to ensure that the event becomes immediately available and can be accessed without delay.


## Gallery Service 
The gallery service is responsible for managing the realtime gallery chat, where users can share images and add likes/dislike to them. The Service uses WebSockets to provide real-time updates to users when new images are added or when likes/dislikes are made.

## Board Service
The board service is responsible for managing the event board, where users can post messages. It uses WebSockets to provide real-time updates to users when new messages are posted or when comments are made.

## Guest-Game Service
The guest-game service is responsible for managing the guest game, where users can play an Akinator-like game. It uses Weka Library to create a decision tree based on the guest-information provided by the users.

