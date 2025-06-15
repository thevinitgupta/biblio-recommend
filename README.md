# Recommendation API

This project implements a high-performance, scalable API for generating and serving vector embeddings of blog posts, enabling "similar post" recommendations. It's designed as an external service to be consumed by a main application, utilizing a robust asynchronous processing pipeline.

---

### Technology Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-FF5733?style=for-the-badge&logoColor=white) <!-- Custom color, no direct logo -->
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-00A985?style=for-the-badge&logoColor=white) <!-- Custom color, no direct logo -->

---

### Project Overview

This API acts as the "**intelligence layer**" for a blog platform. When new blog posts are published or existing ones updated, this service takes their content, transforms it into **vector embeddings** using advanced machine learning models, and stores these embeddings in **Pinecone DB**. Later, when a user is reading a blog post, your main application can query this API to get highly relevant "**similar post**" recommendations in real-time.

The core principle behind this architecture is **asynchronous processing** and **eventual consistency**, ensuring that computationally intensive tasks (like embedding generation) do not block the user experience, while still providing up-to-date recommendations.

---

### Key Features

* **Asynchronous Embedding Generation**: Blog post content is processed in the background using **BullMQ**, ensuring immediate responses for content creation/updates.

* **Efficient Vector Storage & Search**: Leverages **Pinecone DB** for storing high-dimensional vector embeddings and performing lightning-fast similarity searches.

* **Scalable Architecture**: Built with **Node.js**, **Fastify**, and **BullMQ**, designed for horizontal scaling to handle high throughput.


* **Optimized for User Experience**: Supports immediate API responses for embedding tasks and fast recommendation lookups.

* **TypeScript Support**: Enhances code quality, maintainability, and developer experience.

* **Data Freshness**: [TBD] Mechanisms in place to keep embeddings synchronized with the latest blog post content from **MongoDB**.


---

### Architecture Flow

1.  **Blog Post Event (Spring Boot Backend)**: A new blog post is created or updated in MongoDB via your Spring Boot backend.

2.  **API Call (Spring Boot -> Node.js API)**: Spring Boot calls the Recommendation API's `/api/v1/embeddings/enqueue` endpoint with the blog post ID.

3.  **Job Enqueueing (Fastify -> BullMQ)**: The Fastify API receives the request, enqueues an embedding job into a **BullMQ** queue, and immediately responds with a `202 Accepted` status and a job ID for status tracking.

4.  **Content Fetch (BullMQ Worker -> MongoDB)**: A **Node.js** worker, consuming from the **BullMQ** queue, fetches the full blog post content from **MongoDB**.

5.  **Embedding Generation (Node.js Worker)**: The worker processes the content (e.g., chunking large posts), and generates vector embeddings using a configured ML model.

6.  **Vector Storage (Node.js Worker -> Pinecone)**: The generated embeddings are upserted into **Pinecone DB**, using a structured ID (e.g., `postId#chunkId`) for easy management.

7.  **Recommendation Retrieval (Next.js Frontend -> Spring Boot -> Node.js API)**:
    * User views a post on the Next.js frontend, which requests similar posts from the Spring Boot backend.
    * Spring Boot calls the Recommendation API's `/api/v1/recommendations/similar/:postId` endpoint with the current post's ID.
    * The Fastify API queries **Pinecone DB** for similar vector embeddings.
    * Pinecone returns IDs of similar posts, which the Node.js API sends back to Spring Boot.
    * Spring Boot then fetches the full post details from **MongoDB** and sends them to the Next.js frontend.

---

### Getting Started

#### Prerequisites

* **Node.js** (LTS version recommended)
* **Redis** instance (local or hosted)
* **MongoDB** instance (local or hosted)
* **Pinecone DB** account and API key

#### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/thevinitgupta/biblio-recommend.git

    cd recommendation-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root directory and configure the following:

    ```env
    
    PINECONE_API_KEY=
    PINECONE_ENVIRONMENT=
    PINECONE_INDEX_NAME=

    SERVER_PORT=3001
    SERVER_HOST=localhost

    REDIS_HOST=
    REDIS_PORT=
    REDIS_PASSWORD=

    BULL_POST_KEY=

    API_ACCESS_TOKEN=
    ADMIN_USERNAME=
    ADMIN_PASSWORD=

    MONGODB_URI

    ```

#### Running the Application

1.  **Start Redis:** Ensure your Redis instance is running.
2.  **Start MongoDB:** Ensure your MongoDB instance is running.
3.  **Start the API:**
    ```bash
    npm run dev # For development with hot-reloading
    # or
    npm start # For production
    ```
    The API will be available at `http://localhost:3000` (or your configured port).

---

### API Endpoints

#### 1. Enqueue Embedding Job

This endpoint is used by your Spring Boot backend to trigger the embedding generation process for a blog post.

* **URL:** `/api/v1/embeddings/enqueue`
* **Method:** `POST`
* **Request Body (JSON):**

    ```json
    {
        "postId": "unique-blog-post-id-from-mongodb"
    }
    ```
* **Response (JSON):**

    ```json
    {
        "message": "Embedding job enqueued successfully.",
        "jobId": "bullmq-job-id",
        "statusUrl": "/api/v1/embeddings/status/bullmq-job-id"
    }
    ```
* **Status Codes:**
    * `202 Accepted`: Job successfully enqueued.
    * `400 Bad Request`: Invalid `postId` or request body.
    * `500 Internal Server Error`: Issue with enqueuing the job.


#### 2. Get Similar Posts

This endpoint is used by your main application to fetch recommendations based on a given blog post.

* **URL:** `/api/v1/recommendations/similar/:postId`
* **Method:** `GET`
* **Path Parameters:**
    * `postId` (string, required): The ID of the current blog post for which recommendations are needed.
* **Query Parameters:**
    * `limit` (number, optional): Maximum number of similar posts to return (default: 5).
    * `minScore` (number, optional): Minimum similarity score (0-1) for a post to be included.
* **Response (JSON):**

    ```json
    {
        "sourcePostId": "current-blog-post-id",
        "recommendations": [
            {
                "id": "similar-post-id-1",
                "score": 0.95, // Similarity score
                "metadata": { /* any relevant metadata from Pinecone */ }
            },
            {
                "id": "similar-post-id-2",
                "score": 0.88,
                "metadata": { /* any relevant metadata from Pinecone */ }
            }
        ]
    }
    ```
* **Status Codes:**
    * `200 OK`: Recommendations retrieved successfully (empty array if none found).
    * `404 Not Found`: Source `postId` embedding not found in Pinecone.
    * `500 Internal Server Error`: Problem with the recommendation service.

---

### Important Insights for First-Time Visitors

* **"At-Least-Once" Processing (BullMQ)**: **BullMQ** guarantees that a job will be processed at least once. This means your embedding generation logic ***must be idempotent***. If a job is retried, reprocessing the same blog post should produce the same outcome and not cause data inconsistencies or duplicates in Pinecone.
* **Eventual Consistency**: The recommendation system operates on an **eventual consistency** model. There will be a slight delay between a blog post being published/updated in **MongoDB** and its embedding being available/updated in Pinecone. This delay is typically in seconds to a few minutes, which is acceptable for most recommendation systems.

* **Content Chunking**: For long blog posts, the system breaks them down into smaller "**chunks**" before embedding. Each chunk gets its own vector in Pinecone, but they are linked back to the original `postId` using a naming convention (e.g., `postId#chunkId`) and metadata. When querying for similar posts, the system will identify relevant chunks and then group them back by `postId` to return full blog posts.

* **Hybrid Search**: While vector search (semantic similarity) is powerful, consider combining it with traditional keyword search or metadata filtering in your main application for even more precise and contextually relevant recommendations.

* **Monitoring is Key**: Especially for a distributed, asynchronous system, robust monitoring of **BullMQ** queues (job counts, failures), **Redis** health, **Pinecone** performance, and **Node.js** worker metrics is crucial for operational visibility and quick issue resolution.

* **Scaling Redis**: For production deployments, consider **Redis Cluster** for sharding or **Redis Sentinel** for high availability and failover, to ensure Redis (and thus BullMQ) remains a reliable backbone.

* **Error Handling**: Implement robust error handling in your **Node.js** workers. Use `UnrecoverableError` for permanent issues (e.g., invalid data) to prevent endless retries.

---

### Contribution

> NOT OPEN TO CONTRIBUTIONS AT THIS POINT

### License
 
 ISC License