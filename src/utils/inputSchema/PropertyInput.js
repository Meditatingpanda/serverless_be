import Joi from "joi";
import { PreferredTenant, PropertyFurnishing, PropertyParking, PropertyType, WaterSupplyWaterSupply } from "../../enums/PropertyEnums.js";



const PropertyDetailsSchema = Joi.object({
  apartmentType: Joi.string().valid(...Object.values(PropertyType)),
  bhk_type: Joi.string().required(),
  floor_no: Joi.string().required(),
  total_floors: Joi.string().required(),
  facing: Joi.string().optional(),
  built_up_area: Joi.string().required(),
  property_age: Joi.string().optional(),
  description: Joi.string().required(),
});

const PropertyLocationSchema = Joi.object({
  city: Joi.string().required(),
  locality: Joi.string().required(),
  landmark: Joi.string().required(),
});

const PropertyRentalSchema = Joi.object({
  expected_rent: Joi.string().required(),
  rent_negotiable: Joi.boolean().required(),
  security_deposit: Joi.string().required(),
  maintenance_fee: Joi.string().optional(),
  property_availability: Joi.string().required(),
  preferred_tenant: Joi.string().valid(...Object.values(PreferredTenant)),
  furnishings: Joi.string().valid(...Object.values(PropertyFurnishing)),
  parking: Joi.string().valid(...Object.values(PropertyParking)),
});

const PropertyAmenitiesSchema = Joi.object({
  bathrooms: Joi.string().required(),
  balconies: Joi.string().required(),
  water_supply: Joi.string().valid(...Object.values(WaterSupplyWaterSupply)),
  amenities: Joi.array().items(Joi.string()).required(),
});


export const PropertyInputSchema = Joi.object({
    PropertyDetails: PropertyDetailsSchema,
    PropertyLocation: PropertyLocationSchema,
    PropertyRental: PropertyRentalSchema,
    PropertyAmenities: PropertyAmenitiesSchema,
  });