import { FastifyReply, FastifyRequest } from "fastify";
import { SubjectsService, subjectsService as defaultSubjectsService } from "../services/subjects.service.js";

export class SubjectsHandler {
  constructor(private readonly service: SubjectsService = defaultSubjectsService) {}

  /**
   * GET /subjects
   */
  listSubjects = async (_request: FastifyRequest, reply: FastifyReply) => {
    const subjectsList = await this.service.listSubjects();
    return reply.status(200).send(subjectsList);
  };
}

export const subjectsHandler = new SubjectsHandler();
