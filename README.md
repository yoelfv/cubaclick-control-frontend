Cubaclick Control – Business Management System

A business management application built with React, TypeScript, Vite, and Strapi.
The system provides a centralized interface for managing orders, customers, sales representatives,
bank accounts, and business statistics.

Project Overview

Cubaclick Control is an administrative application developed to support the daily operations of an online store.

It connects to a centralized Strapi backend through a REST API, sharing the same backend and database with a separate e-commerce frontend.

The application brings together essential business information in one place, helping organize commercial records and monitor order-related activities.

Key Features

    Dashboard: Provides an overview of relevant business information and operational indicators.

    Order Management: Displays and manages customer orders and their payment status.

    Customer Management: Organizes customer records and provides access to their order history.

    Sales Representative Management: Maintains sales representative records and displays their
    associated orders.

    Bank Account Management: Organizes information about the bank accounts used by the business
    and tracks which orders have been paid into each account.

    Statistics: Provides access to business statistics and performance information.

Technology Stack

Frontend

    React

    TypeScript

    Vite

    HTML5 and CSS3

Backend Integration

    Strapi

    REST API

    Shared relational database

Development Tools

    Node.js

    npm

    Git and GitHub

Architecture

The application uses a component-based frontend architecture and communicates with a centralized
Strapi backend through REST API endpoints.

The same backend also powers a separate online store developed with Astro, React, and TypeScript.

This shared architecture allows both applications to work with centralized business data.

Related repository:

tienda-backend – Shared Strapi Backend

Getting Started

Prerequisites

    Node.js

    npm

    Access to a running Strapi backend

Installation

Clone the repository:

git clone https://github.com/yoelfv/cubaclick-control-frontend.git
cd cubaclick-control-frontend

Install dependencies:

npm install

Configure the application to connect to the appropriate Strapi API using the required
environment variables.

Start the development server:

npm run dev

Build the production version:

npm run build

Developer

Designed and developed as a business management application, demonstrating practical
experience in frontend development, TypeScript, REST API integration, centralized data
management, and business information systems.
