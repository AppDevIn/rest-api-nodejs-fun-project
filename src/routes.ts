import {Express, Request, Response} from "express";
import {requiresUser, validateRequest} from "./middleware";
import {createUserSchema, createUserSessionSchema} from './scheme/user.scheme'
import {
    createUserHandler,
    createUserSessionHandler,
    getUserSessionsHandler,
    invalidateUserSessionHandler
} from "./controller/user.controller";
import {createPostSchema, deletePostSchema, updatePostSchema} from "./scheme/post.scheme";
import {createPostHandler, deletePostHandler, getPostHandler, updatePostHandler} from "./controller/post.controller";

export default function (app: Express) {
    app.get("/healthcheck", (req: Request, res:Response) => res.sendStatus(200));
    // Register user
    // POST /api/user
    app.get("/api/users", validateRequest(createUserSchema), createUserHandler);

    // Login
    // POST /api/sessions
    app.post("/api/sessions", validateRequest(createUserSessionSchema), createUserSessionHandler);

    // Get the user's sessions
    // GET /api/sessions
    app.get("/api/sessions", requiresUser, getUserSessionsHandler);

    // Logout
    // DELETE api/sessions
    app.delete("/api/sessions", requiresUser, invalidateUserSessionHandler);


    // Create a post
    app.post(
        "/api/posts",
        [requiresUser, validateRequest(createPostSchema)],
        createPostHandler
    );

    // Update a post
    app.put(
        "/api/posts/:postId",
        [requiresUser, validateRequest(updatePostSchema)],
        updatePostHandler
    );

    // Get a post
    app.get("/api/posts/:postId", getPostHandler);

    // Delete a post
    app.delete(
        "/api/posts/:postId",
        [requiresUser, validateRequest(deletePostSchema)],
        deletePostHandler
    );
}
