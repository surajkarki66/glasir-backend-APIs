import Joi from "joi";

const schemas = {
  createProfile: Joi.object().keys({
    title: Joi.string().max(70).required(),
    overview: Joi.string().max(5000).required(),
    hourlyRate: Joi.number().greater(0).required(),
    location: Joi.object()
      .keys({
        country: Joi.string().valid("Nepal").required(),
        street: Joi.string().max(70).required(),
        city: Joi.string().max(70).required(),
        zip: Joi.number().integer().required(),
        province: Joi.string()
          .valid(
            "Province No. 1",
            "Province No. 2",
            "Bagmati Province",
            "Gandaki Province",
            "Lumbini Province",
            "Karnali Province",
            "Sudurpashchim Province"
          )
          .required(),
      })
      .required(),
    phone: Joi.string().max(14).required(),
    citizenship: Joi.object().keys({
      citizenshipNumber: Joi.string().max(50).required(),
      citizenshipUrl: Joi.string().required(),
    }),
    resume: Joi.string(),
    expertise: Joi.object()
      .keys({
        service: Joi.string()
          .valid(
            "Administration",
            "Design & Creative",
            "Engineering & Architecture",
            "IT & Networking",
            "Marketing",
            "Web, Mobile & Software Dev",
            "Writing"
          )
          .required(),
        serviceType: Joi.array().items(Joi.string()).max(4).required(),
        skills: Joi.array().items(Joi.string()).max(9).required(),
        expertiseLevel: Joi.string()
          .valid("Entry level", "Intermediate", "Expert")
          .required(),
      })
      .required(),
    education: Joi.array()
      .items(
        Joi.object().keys({
          school: Joi.string().max(200).required(),
          areaOfStudy: Joi.string().max(70),
          degree: Joi.string(),
          datesAttended: Joi.object().keys({
            from: Joi.date().iso().required(),
            to: Joi.date().iso().greater(Joi.ref("from")).required(),
          }),
          description: Joi.string(),
        })
      )
      .max(4),
    employement: Joi.array()
      .items(
        Joi.object().keys({
          company: Joi.string().max(200).required(),
          location: Joi.object()
            .keys({
              country: Joi.string().max(70).required(),
              city: Joi.string().max(70).required(),
            })
            .required(),
          title: Joi.string().max(70).required(),
          period: Joi.object()
            .keys({
              from: Joi.date().iso().required(),
              to: Joi.date().iso().greater(Joi.ref("from")),
            })
            .required(),
          description: Joi.string().max(255),
        })
      )
      .max(10),
    languages: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string().max(255).required(),
          proficiency: Joi.string()
            .valid("Basic", "Conversational", "Fluent", "Native or Bilingual")
            .required(),
        })
      )
      .max(10)
      .required(),

    isVerified: Joi.boolean().required(),
  }),
};
export default schemas;
