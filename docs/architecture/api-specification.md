# API Specification


## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Crew Up API
  version: 1.0.0
  description: REST API for Crew Up production crew database platform
servers:
  - url: https://crew-up.vercel.app/api
    description: Production server
  - url: http://localhost:3000/api
    description: Local development server

paths:
  /profiles:
    get:
      summary: Search crew profiles
      parameters:
        - name: q
          in: query
          schema:
            type: string
          description: Search query (e.g., "AC in Nashville")
        - name: role
          in: query
          schema:
            type: string
          description: Filter by role
        - name: city
          in: query
          schema:
            type: string
          description: Filter by city
        - name: state
          in: query
          schema:
            type: string
          description: Filter by state
        - name: union_status
          in: query
          schema:
            type: string
            enum: [union, non-union, either]
          description: Filter by union status
        - name: page
          in: query
          schema:
            type: integer
            default: 1
          description: Page number
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
          description: Results per page
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  profiles:
                    type: array
                    items:
                      $ref: '#/components/schemas/Profile'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /profiles/{slug}:
    get:
      summary: Get profile by slug
      parameters:
        - name: slug
          in: path
          required: true
          schema:
            type: string
          description: Profile slug
      responses:
        '200':
          description: Profile found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProfileWithCredits'
        '404':
          description: Profile not found

  /profiles/{id}/contact:
    post:
      summary: Submit contact inquiry
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - producer_name
                - producer_email
                - message
              properties:
                producer_name:
                  type: string
                producer_email:
                  type: string
                  format: email
                producer_phone:
                  type: string
                message:
                  type: string
                  maxLength: 500
                shoot_dates:
                  type: string
      responses:
        '200':
          description: Inquiry submitted successfully
        '400':
          description: Invalid request
        '429':
          description: Rate limit exceeded

  /admin/profiles:
    post:
      summary: Create new profile (admin only)
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProfileRequest'
      responses:
        '201':
          description: Profile created
        '401':
          description: Unauthorized

  /admin/profiles/bulk-import:
    post:
      summary: Bulk import profiles (admin only)
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: Import completed

  /auth/claim/{token}:
    get:
      summary: Verify claim token
      parameters:
        - name: token
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Token valid
        '404':
          description: Token invalid or expired

    post:
      summary: Claim profile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
                - email
                - password
              properties:
                token:
                  type: string
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Profile claimed successfully
        '400':
          description: Invalid request

components:
  schemas:
    Profile:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        primary_role:
          type: string
        primary_location_city:
          type: string
        primary_location_state:
          type: string
        slug:
          type: string
        photo_url:
          type: string
          nullable: true
        bio:
          type: string
          nullable: true
        union_status:
          type: string
          enum: [union, non-union, either]
          nullable: true

    ProfileWithCredits:
      allOf:
        - $ref: '#/components/schemas/Profile'
        - type: object
          properties:
            credits:
              type: array
              items:
                $ref: '#/components/schemas/Credit'

    Credit:
      type: object
      properties:
        id:
          type: string
        project_title:
          type: string
        role:
          type: string
        project_type:
          type: string
        year:
          type: integer

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

    CreateProfileRequest:
      type: object
      required:
        - name
        - primary_role
        - primary_location_city
        - primary_location_state
        - contact_email
      properties:
        name:
          type: string
        primary_role:
          type: string
        primary_location_city:
          type: string
        primary_location_state:
          type: string
        contact_email:
          type: string
          format: email
        # ... other optional fields

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

