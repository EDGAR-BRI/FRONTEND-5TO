CREATE TABLE IF NOT EXISTS "Role" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"code" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Supplier" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "User" (
	"id" bigint NOT NULL,
	"ci" varchar(255) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"roleId" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Appoinment" (
	"id" serial NOT NULL UNIQUE,
	"doctor_id" bigint NOT NULL,
	"scheduled_range" varchar(255) NOT NULL,
	"receptionist_id" bigint NOT NULL,
	"form_id" bigint NOT NULL,
	"status_id" bigint NOT NULL,
	"type_id" bigint NOT NULL,
	"reson_visit" varchar(255) NOT NULL,
	"price" numeric(10,0) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RoleSalary" (
	"salary" numeric(10,0) NOT NULL,
	"role_id" bigint NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "UserContact" (
	"id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Consultation" (
	"id" serial NOT NULL UNIQUE,
	"date" date NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone NOT NULL,
	"doctor_id" bigint NOT NULL,
	"pacient_id" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AppointmentType" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Form" (
	"id" serial NOT NULL UNIQUE,
	"userId" bigint NOT NULL,
	"wanted_specialty_id" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Symptom" (
	"id" serial NOT NULL UNIQUE,
	"formId" bigint NOT NULL,
	"bodyPart" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AppointedConsultation" (
	"appointment_id" bigint NOT NULL,
	"consultation_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "Product" (
	"id" serial NOT NULL,
	"category_id" bigint NOT NULL,
	"unit_id" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"cost_price" numeric(10,0) NOT NULL,
	"min_stock" bigint NOT NULL,
	"is_perishable" boolean NOT NULL,
	"is_active" boolean NOT NULL,
	"type" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PaymentMethod" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"currency" varchar(255) NOT NULL,
	"is_active" boolean NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PurchasePayment" (
	"id" serial NOT NULL,
	"purchase_Id" bigint NOT NULL,
	"payment_method_id" varchar(255) NOT NULL,
	"amount" numeric(10,0) NOT NULL,
	"currency" varchar(255) NOT NULL,
	"reference" varchar(255) NOT NULL,
	"payment_date" timestamp without time zone NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PurchaseItem" (
	"id" serial NOT NULL,
	"purchase_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"product_presentation_id" bigint NOT NULL,
	"quantity" bigint NOT NULL,
	"unit_cost" numeric(10,0) NOT NULL,
	"expiration_date" date NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Purchase" (
	"id" serial NOT NULL,
	"supplier_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"sub_total" numeric(10,0) NOT NULL,
	"tax_amount" numeric(10,0) NOT NULL,
	"total_cost" numeric(10,0) NOT NULL,
	"status" varchar(255) NOT NULL,
	"exchange_rate_id" bigint NOT NULL,
	"reference" varchar(255) NOT NULL,
	"observation" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"conditions" varchar(255) NOT NULL,
	"payment_status" bigint NOT NULL,
	"remaining_balance" numeric(10,0) NOT NULL,
	"payment_due_date" timestamp without time zone NOT NULL,
	"discount" numeric(10,0) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockLot" (
	"id" serial NOT NULL UNIQUE,
	"quantity" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"expiration_date" date NOT NULL,
	"lot_cost" numeric(10,0) NOT NULL,
	"createdAt" date NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Tax" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"rate" numeric(10,0) NOT NULL,
	"code" varchar(255) NOT NULL,
	"isActive" boolean NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ExchangeRate" (
	"id" serial NOT NULL,
	"rate" numeric(10,0) NOT NULL,
	"createdAt" timestamp without time zone NOT NULL,
	"is_active" boolean NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductPresentation" (
	"id" serial NOT NULL UNIQUE,
	"product_id" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"factor" numeric(10,0) NOT NULL,
	"bar_code" varchar(255) NOT NULL,
	"price" numeric(10,0) NOT NULL,
	"is_active" boolean NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MedicalSpecialty" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"consultation_price" numeric(10,0) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserDoctor" (
	"user_id" bigint NOT NULL,
	"specialty_id" bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS "ProductConsultation" (
	"id" serial NOT NULL UNIQUE,
	"product_id" bigint NOT NULL,
	"consultation_id" bigint NOT NULL,
	"quantity" numeric(10,0) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MeasurementUnit" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(255) NOT NULL,
	"is_active" boolean NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Invoice" (
	"id" serial NOT NULL UNIQUE,
	"consultation_id" bigint NOT NULL,
	"exchange_rate_id" bigint NOT NULL,
	"total_usd" numeric(10,0) NOT NULL,
	"enum_status" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ScheduleCycle" (
	"id" serial NOT NULL UNIQUE,
	"employee_id" bigint NOT NULL,
	"desc" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InvoicePayment" (
	"id" serial NOT NULL UNIQUE,
	"invoice_id" bigint NOT NULL,
	"payment_method_id" bigint NOT NULL,
	"amount_paid" numeric(10,0) NOT NULL,
	"igtf_amount" numeric(10,0) NOT NULL,
	"currency_id" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ScheduleWeek" (
	"week_number" bigint NOT NULL,
	"sched_cycle_id" bigint NOT NULL,
	PRIMARY KEY ("week_number", "sched_cycle_id")
);

CREATE TABLE IF NOT EXISTS "InvoiceDetail" (
	"id" serial NOT NULL,
	"invoice_id" bigint NOT NULL,
	"description" varchar(255) NOT NULL,
	"product_id" bigint,
	"quantity" bigint NOT NULL,
	"unit_price" numeric(12,2) NOT NULL,
	"sub_total" numeric(12,2) NOT NULL,
	"tax_id" bigint NOT NULL,
	"is_commissionable" boolean NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockMovement" (
	"id" serial NOT NULL,
	"product_id" bigint NOT NULL,
	"stock_lot_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"type" varchar(255) NOT NULL,
	"quantity" bigint NOT NULL,
	"reason" varchar(255) NOT NULL,
	"date" timestamp without time zone NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ScheduleDay" (
	"id" serial NOT NULL UNIQUE,
	"day_number" bigint NOT NULL,
	"week_number" bigint NOT NULL,
	"sched_cycle_id" bigint NOT NULL,
	"starts_at" time without time zone NOT NULL,
	"ends_at" time without time zone NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EnumStatus" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ScheduleCycleHistory" (
	"sched_cycle_id" serial NOT NULL UNIQUE,
	"started_at" timestamp with time zone NOT NULL,
	"stopped_at" timestamp with time zone NOT NULL,
	PRIMARY KEY ("sched_cycle_id")
);

CREATE TABLE IF NOT EXISTS "ScheduleWeekHistory" (
	"week_number" serial NOT NULL UNIQUE,
	"sched_cycle_id" bigint NOT NULL,
	PRIMARY KEY ("week_number", "sched_cycle_id")
);

CREATE TABLE IF NOT EXISTS "ScheduleDayHistory" (
	"id" serial NOT NULL UNIQUE,
	"day_number" bigint NOT NULL,
	"week_number" bigint NOT NULL,
	"sched_cycle_id" bigint NOT NULL,
	"starts_at" time without time zone NOT NULL,
	"ends_at" time without time zone NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BodyPart" (
	"id" serial NOT NULL UNIQUE,
	"symptom_id" bigint NOT NULL,
	"face" varchar(255) NOT NULL,
	"x_axis" numeric(10,0) NOT NULL,
	"y_axis" numeric(10,0) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PrescribedMedicine" (
	"id" serial NOT NULL UNIQUE,
	"consultation_id" bigint NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PrescribeMedicineSold" (
	"presc_med_id" serial NOT NULL UNIQUE,
	"prod_consult_id" bigint NOT NULL,
	"quantity" numeric(10,0) NOT NULL,
	PRIMARY KEY ("presc_med_id")
);

CREATE TABLE IF NOT EXISTS "PrescribeMedicineForeign" (
	"presc_med_id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"quantity" numeric(10,0) NOT NULL,
	PRIMARY KEY ("presc_med_id")
);

CREATE TABLE IF NOT EXISTS "MedicineDose" (
	"presc_med_id" serial NOT NULL UNIQUE,
	"amount_dose" numeric(10,0) NOT NULL,
	"time_of_dose" time without time zone NOT NULL,
	"days_for_next_dose" bigint NOT NULL,
	PRIMARY KEY ("presc_med_id")
);

CREATE TABLE IF NOT EXISTS "Category" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);



ALTER TABLE "User" ADD CONSTRAINT "User_fk4" FOREIGN KEY ("roleId") REFERENCES "Role"("id");
ALTER TABLE "Appoinment" ADD CONSTRAINT "Appoinment_fk1" FOREIGN KEY ("doctor_id") REFERENCES "UserDoctor"("user_id");

ALTER TABLE "Appoinment" ADD CONSTRAINT "Appoinment_fk3" FOREIGN KEY ("receptionist_id") REFERENCES "User"("id");

ALTER TABLE "Appoinment" ADD CONSTRAINT "Appoinment_fk4" FOREIGN KEY ("form_id") REFERENCES "Form"("id");

ALTER TABLE "Appoinment" ADD CONSTRAINT "Appoinment_fk5" FOREIGN KEY ("status_id") REFERENCES "EnumStatus"("id");

ALTER TABLE "Appoinment" ADD CONSTRAINT "Appoinment_fk6" FOREIGN KEY ("type_id") REFERENCES "AppointmentType"("id");
ALTER TABLE "RoleSalary" ADD CONSTRAINT "RoleSalary_fk1" FOREIGN KEY ("role_id") REFERENCES "Role"("id");
ALTER TABLE "UserContact" ADD CONSTRAINT "UserContact_fk1" FOREIGN KEY ("user_id") REFERENCES "User"("id");
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_fk4" FOREIGN KEY ("doctor_id") REFERENCES "UserDoctor"("user_id");

ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_fk5" FOREIGN KEY ("pacient_id") REFERENCES "User"("id");

ALTER TABLE "Form" ADD CONSTRAINT "Form_fk1" FOREIGN KEY ("userId") REFERENCES "User"("id");

ALTER TABLE "Form" ADD CONSTRAINT "Form_fk2" FOREIGN KEY ("wanted_specialty_id") REFERENCES "MedicalSpecialty"("id");
ALTER TABLE "Symptom" ADD CONSTRAINT "Symptom_fk1" FOREIGN KEY ("formId") REFERENCES "Form"("id");
ALTER TABLE "AppointedConsultation" ADD CONSTRAINT "AppointedConsultation_fk0" FOREIGN KEY ("appointment_id") REFERENCES "Appoinment"("id");

ALTER TABLE "AppointedConsultation" ADD CONSTRAINT "AppointedConsultation_fk1" FOREIGN KEY ("consultation_id") REFERENCES "Consultation"("id");
ALTER TABLE "Product" ADD CONSTRAINT "Product_fk1" FOREIGN KEY ("category_id") REFERENCES "Category"("id");

ALTER TABLE "Product" ADD CONSTRAINT "Product_fk2" FOREIGN KEY ("unit_id") REFERENCES "MeasurementUnit"("id");

ALTER TABLE "PurchasePayment" ADD CONSTRAINT "PurchasePayment_fk1" FOREIGN KEY ("purchase_Id") REFERENCES "Purchase"("id");

ALTER TABLE "PurchasePayment" ADD CONSTRAINT "PurchasePayment_fk2" FOREIGN KEY ("payment_method_id") REFERENCES "PaymentMethod"("id");
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_fk1" FOREIGN KEY ("purchase_id") REFERENCES "Purchase"("id");

ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_fk2" FOREIGN KEY ("product_id") REFERENCES "Product"("id");

ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_fk3" FOREIGN KEY ("product_presentation_id") REFERENCES "ProductPresentation"("id");
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_fk1" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id");

ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_fk2" FOREIGN KEY ("user_id") REFERENCES "BusinessMember"("id");

ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_fk7" FOREIGN KEY ("exchange_rate_id") REFERENCES "ExchangeRate"("id");
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_fk2" FOREIGN KEY ("product_id") REFERENCES "Product"("id");


ALTER TABLE "ProductPresentation" ADD CONSTRAINT "ProductPresentation_fk1" FOREIGN KEY ("product_id") REFERENCES "Product"("id");

ALTER TABLE "UserDoctor" ADD CONSTRAINT "UserDoctor_fk0" FOREIGN KEY ("user_id") REFERENCES "User"("id");

ALTER TABLE "UserDoctor" ADD CONSTRAINT "UserDoctor_fk1" FOREIGN KEY ("specialty_id") REFERENCES "MedicalSpecialty"("id");
ALTER TABLE "ProductConsultation" ADD CONSTRAINT "ProductConsultation_fk1" FOREIGN KEY ("product_id") REFERENCES "Product"("id");

ALTER TABLE "ProductConsultation" ADD CONSTRAINT "ProductConsultation_fk2" FOREIGN KEY ("consultation_id") REFERENCES "Consultation"("id");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_fk1" FOREIGN KEY ("consultation_id") REFERENCES "Consultation"("id");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_fk2" FOREIGN KEY ("exchange_rate_id") REFERENCES "ExchangeRate"("id");
ALTER TABLE "ScheduleCycle" ADD CONSTRAINT "ScheduleCycle_fk1" FOREIGN KEY ("employee_id") REFERENCES "User"("id");
ALTER TABLE "InvoicePayment" ADD CONSTRAINT "InvoicePayment_fk1" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id");

ALTER TABLE "InvoicePayment" ADD CONSTRAINT "InvoicePayment_fk2" FOREIGN KEY ("payment_method_id") REFERENCES "PaymentMethod"("id");
ALTER TABLE "ScheduleWeek" ADD CONSTRAINT "ScheduleWeek_fk1" FOREIGN KEY ("sched_cycle_id") REFERENCES "ScheduleCycle"("id");
ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_fk1" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id");

ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_fk3" FOREIGN KEY ("product_id") REFERENCES "Product"("id,");

ALTER TABLE "InvoiceDetail" ADD CONSTRAINT "InvoiceDetail_fk7" FOREIGN KEY ("tax_id") REFERENCES "Tax"("id");
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_fk1" FOREIGN KEY ("product_id") REFERENCES "Product"("id");

ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_fk2" FOREIGN KEY ("stock_lot_id") REFERENCES "StockLots"("id");

ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_fk3" FOREIGN KEY ("user_id") REFERENCES "User"("id");
ALTER TABLE "ScheduleDay" ADD CONSTRAINT "ScheduleDay_fk2" FOREIGN KEY ("week_number") REFERENCES "ScheduleWeek"("week_number");

ALTER TABLE "ScheduleDay" ADD CONSTRAINT "ScheduleDay_fk3" FOREIGN KEY ("sched_cycle_id") REFERENCES "ScheduleWeek"("sched_cycle_id");

ALTER TABLE "ScheduleCycleHistory" ADD CONSTRAINT "ScheduleCycleHistory_fk0" FOREIGN KEY ("sched_cycle_id") REFERENCES "ScheduleCycle"("id");
ALTER TABLE "ScheduleWeekHistory" ADD CONSTRAINT "ScheduleWeekHistory_fk1" FOREIGN KEY ("sched_cycle_id") REFERENCES "ScheduleCycleHistory"("sched_cycle_id");
ALTER TABLE "ScheduleDayHistory" ADD CONSTRAINT "ScheduleDayHistory_fk2" FOREIGN KEY ("week_number") REFERENCES "ScheduleWeekHistory"("week_number");

ALTER TABLE "ScheduleDayHistory" ADD CONSTRAINT "ScheduleDayHistory_fk3" FOREIGN KEY ("sched_cycle_id") REFERENCES "ScheduleWeekHistory"("sched_cycle_id");
ALTER TABLE "BodyPart" ADD CONSTRAINT "BodyPart_fk1" FOREIGN KEY ("symptom_id") REFERENCES "Symptom"("id");
ALTER TABLE "PrescribedMedicine" ADD CONSTRAINT "PrescribedMedicine_fk1" FOREIGN KEY ("consultation_id") REFERENCES "Consultation"("id");
ALTER TABLE "PrescribeMedicineSold" ADD CONSTRAINT "PrescribeMedicineSold_fk0" FOREIGN KEY ("presc_med_id") REFERENCES "PrescribedMedicine"("id");

ALTER TABLE "PrescribeMedicineSold" ADD CONSTRAINT "PrescribeMedicineSold_fk1" FOREIGN KEY ("prod_consult_id") REFERENCES "ProductConsultation"("id");
ALTER TABLE "PrescribeMedicineForeign" ADD CONSTRAINT "PrescribeMedicineForeign_fk0" FOREIGN KEY ("presc_med_id") REFERENCES "PrescribedMedicine"("id");
ALTER TABLE "MedicineDose" ADD CONSTRAINT "MedicineDose_fk0" FOREIGN KEY ("presc_med_id") REFERENCES "PrescribedMedicine"("id");
