
exports.up = async function(knex, Promise) {
 
    await knex.schema.createTable("user",function(table){
        table.increments("id").primary();
        table.string("name",).notNullable();
        table.string("email").notNullable().unique();
        table.string("password").notNullable();
        table.text("verificationToken").nullable();
      //  table.enu("userProfileImg").nullable();
        table.string("mobileNo",10).nullable();
        table.boolean("isMobileVerified").notNullable().defaultTo(false);
        table.boolean("isEmailVerified").notNullable().defaultTo(false);
        table.integer("otp",8).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        
    }).createTable("userAddress",(table)=>{
        table.increments("id");
        table.integer("userId").unsigned().references("id").inTable("user").onDelete("CASCADE");
        table.string("colony").nullable();
        table.string("house").nullable();
        table.string("landMark").nullable();
        table.integer("zipCode",6).nullable();
        table.string("state").nullable();

    })
  
};

exports.down = async function(knex, Promise) {
    await knex.schema.dropTableIfExists("userAddress");
    await knex.schema.dropTableIfExists("user");
    

};
