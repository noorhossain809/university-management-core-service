-- CreateEnum
CREATE TYPE "PaymentMethodStatus" AS ENUM ('CASH', 'ONLINE');

-- CreateTable
CREATE TABLE "student_semester_payment_histories" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentSemesterPaymentId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethodStatus" NOT NULL DEFAULT 'ONLINE',
    "dueAmount" INTEGER NOT NULL DEFAULT 0,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN DEFAULT false,

    CONSTRAINT "student_semester_payment_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "student_semester_payment_histories" ADD CONSTRAINT "student_semester_payment_histories_studentSemesterPaymentI_fkey" FOREIGN KEY ("studentSemesterPaymentId") REFERENCES "StudentSemesterPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
