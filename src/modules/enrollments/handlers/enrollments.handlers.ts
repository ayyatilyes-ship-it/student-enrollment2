import { FastifyReply, FastifyRequest } from "fastify";
import { enrollParamSchema, enrollStudentSchema } from "../dto/enrollments.dto.js";
import {
  EnrollmentsService,
  enrollmentsService as defaultEnrollmentsService,
} from "../services/enrollments.service.js";

export class EnrollmentsHandler {
  constructor(private readonly service: EnrollmentsService = defaultEnrollmentsService) {}

  /**
   * POST /students/:id/enroll
   */
  enrollStudent = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = enrollParamSchema.parse(request.params);
    const body = enrollStudentSchema.parse(request.body);
    const enrollment = await this.service.enrollStudent(id, body);
    return reply.status(201).send(enrollment);
  };
}

export const enrollmentsHandler = new EnrollmentsHandler();
