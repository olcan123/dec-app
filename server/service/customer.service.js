import prisma from "~~/server/utils/prisma";

// ANCHOR: listCustomers
export const listCustomers = async () => {
  try {
    return await prisma.customer.findMany({});
  } catch (error) {
    throw new Error("Failed to fetch customers: " + error);
  }
};
// ANCHOR_END: listCustomers

// ANCHOR: getCustomerById
export const getCustomerById = async (customerId) => {
  try {
    return await prisma.customer.findUnique({
      where: { id: parseInt(customerId) },
    });
  } catch (error) {
    throw new Error("Failed to fetch customer: " + error);
  }
};
// ANCHOR_END: getCustomerById

// ANCHOR: createCustomer
export const createCustomer = async (customerData) => {
  try {
    return await prisma.customer.create({
      data: customerData,
    });
  } catch (error) {
    throw new Error("Failed to create Customer: " + error);
  }
};
// ANCHOR_END: createCustomer

// ANCHOR: updateCustomer
export const updateCustomer = async (customerId, customerData) => {
  try {
    return await prisma.customer.update({
      where: { id: parseInt(customerId) },
      data: customerData,
    });
  } catch (error) {
    throw new Error("Failed to update Customer: " + error);
  }
};
// ANCHOR_END: updateCustomer

// ANCHOR: deleteCustomer
export const deleteCustomer = async (customerId) => {
  try {
    return await prisma.customer.delete({
      where: { id: parseInt(customerId) },
    });
  } catch (error) {
    throw new Error("Failed to delete Customer: " + error);
  }
};
// ANCHOR_END: deleteCustomer
