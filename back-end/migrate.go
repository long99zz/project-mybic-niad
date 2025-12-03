package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MigrationConfig struct {
	MariaDBDSN string
	MongoURI   string
	DBName     string
}

func runMigration() {
	godotenv.Load("../.env")
	godotenv.Load(".env")

	cfg := MigrationConfig{
		MariaDBDSN: os.Getenv("MARIADB_DSN"),
		MongoURI:   os.Getenv("MONGO_URI"),
		DBName:     os.Getenv("DB_NAME"),
	}

	if cfg.MariaDBDSN == "" {
		cfg.MariaDBDSN = "root:password@tcp(localhost:3306)/bic_insurance?parseTime=true"
	}
	if cfg.MongoURI == "" {
		cfg.MongoURI = "mongodb://localhost:27017"
	}
	if cfg.DBName == "" {
		cfg.DBName = "bic_insurance"
	}

	fmt.Println("🔄 Starting MariaDB to MongoDB Migration...")
	fmt.Printf("MariaDB: %s\n", cfg.MariaDBDSN)
	fmt.Printf("MongoDB: %s\n", cfg.MongoURI)
	fmt.Printf("Database: %s\n\n", cfg.DBName)

	mariadb, err := sql.Open("mysql", cfg.MariaDBDSN)
	if err != nil {
		log.Fatalf("❌ Failed to connect to MariaDB: %v", err)
	}
	defer mariadb.Close()

	if err := mariadb.Ping(); err != nil {
		log.Fatalf("❌ MariaDB connection failed: %v", err)
	}
	fmt.Println("✅ Connected to MariaDB")

	mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatalf("❌ Failed to connect to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect(context.Background())

	if err := mongoClient.Ping(context.Background(), nil); err != nil {
		log.Fatalf("❌ MongoDB connection failed: %v", err)
	}
	fmt.Println("✅ Connected to MongoDB Atlas")

	mongoDB := mongoClient.Database(cfg.DBName)

	fmt.Println("🗑️  Clearing existing data...")
	if err := mongoDB.Drop(context.Background()); err != nil {
		log.Printf("⚠️  Could not drop database: %v", err)
	}

	fmt.Println("\n📊 Starting data migration...\n")

	migrateUsers(mariadb, mongoDB)
	migrateProducts(mariadb, mongoDB)
	migrateInvoices(mariadb, mongoDB)
	migrateParticipants(mariadb, mongoDB)
	migrateTravelParticipants(mariadb, mongoDB)
	migrateInsuranceParticipantInfo(mariadb, mongoDB)
	migrateCarInsuranceForms(mariadb, mongoDB)
	migrateMotorbikeInsuranceForms(mariadb, mongoDB)
	migrateCustomerRegistration(mariadb, mongoDB)
	migrateCategories(mariadb, mongoDB)
	migratePosts(mariadb, mongoDB)
	migrateHomeInsuranceInvoices(mariadb, mongoDB)
	migrateInsuranceForms(mariadb, mongoDB)
	migrateInsuranceVehicleInfo(mariadb, mongoDB)
	migrateInvoicesMaster(mariadb, mongoDB)
	migratePaymentTransactions(mariadb, mongoDB)
	migratePersonalInsuranceForms(mariadb, mongoDB)
	migrateTravelInsuranceInvoices(mariadb, mongoDB)

	fmt.Println("\n✅ Migration completed successfully!")
}

// ===== CORE COLLECTIONS =====

func migrateUsers(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("👥 Migrating users...")
	rows, err := mariadb.Query(`
		SELECT id, account_type, first_name, last_name, phone, email, password, citizen_id, 
		       gender, date_of_birth, province, district, sub_district, house_number, 
		       created_at, updated_at, role, city
		FROM users
	`)
	if err != nil {
		log.Printf("⚠️  Error querying users: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var id int
		var accountType, firstName, lastName, phone, email, password, citizenID, gender sql.NullString
		var dob sql.NullTime
		var province, district, subdistrict, houseNumber, role, city sql.NullString
		var createdAt, updatedAt sql.NullTime

		if err := rows.Scan(&id, &accountType, &firstName, &lastName, &phone, &email, &password,
			&citizenID, &gender, &dob, &province, &district, &subdistrict, &houseNumber,
			&createdAt, &updatedAt, &role, &city); err != nil {
			log.Printf("⚠️  Error scanning user: %v", err)
			continue
		}

		user := bson.M{
			"_id": id,
		}

		if createdAt.Valid {
			user["created_at"] = createdAt.Time
		}
		if updatedAt.Valid {
			user["updated_at"] = updatedAt.Time
		}

		if accountType.Valid {
			user["account_type"] = accountType.String
		}
		if firstName.Valid {
			user["first_name"] = firstName.String
		}
		if lastName.Valid {
			user["last_name"] = lastName.String
		}
		if phone.Valid {
			user["phone"] = phone.String
		}
		if email.Valid {
			user["email"] = email.String
		}
		if password.Valid {
			user["password"] = password.String
		}
		if citizenID.Valid {
			user["citizen_id"] = citizenID.String
		}
		if gender.Valid {
			user["gender"] = gender.String
		}
		if dob.Valid {
			user["date_of_birth"] = dob.Time
		}
		if province.Valid {
			user["province"] = province.String
		}
		if district.Valid {
			user["district"] = district.String
		}
		if subdistrict.Valid {
			user["sub_district"] = subdistrict.String
		}
		if houseNumber.Valid {
			user["house_number"] = houseNumber.String
		}
		if role.Valid {
			user["role"] = role.String
		}
		if city.Valid {
			user["city"] = city.String
		}

		documents = append(documents, user)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting users: %v", err)
		} else {
			fmt.Printf("   ✅ %d users migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No users to migrate")
	}
}

func migrateProducts(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("📦 Migrating products...")
	rows, err := mariadb.Query(`
		SELECT product_id, name, category_id, image, quantity, price, sale_price,
		       general_info, insurance_benefits, insurance_fee, claim_guidelines, form_rules,
		       created_at, updated_at
		FROM products
	`)
	if err != nil {
		log.Printf("⚠️  Error querying products: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var productID, categoryID, quantity int
		var name, image sql.NullString
		var price, salePrice sql.NullFloat64
		var generalInfo, insuranceBenefits, insuranceFee, claimGuidelines, formRules sql.NullString
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&productID, &name, &categoryID, &image, &quantity, &price, &salePrice,
			&generalInfo, &insuranceBenefits, &insuranceFee, &claimGuidelines, &formRules,
			&createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning product: %v", err)
			continue
		}

		product := bson.M{
			"_id":         productID,
			"category_id": categoryID,
			"quantity":    quantity,
			"created_at":  createdAt,
			"updated_at":  updatedAt,
		}

		if name.Valid {
			product["name"] = name.String
		}
		if image.Valid {
			product["image"] = image.String
		}
		if price.Valid {
			product["price"] = price.Float64
		}
		if salePrice.Valid {
			product["sale_price"] = salePrice.Float64
		}
		if generalInfo.Valid {
			product["general_info"] = generalInfo.String
		}
		if insuranceBenefits.Valid {
			product["insurance_benefits"] = insuranceBenefits.String
		}
		if insuranceFee.Valid {
			product["insurance_fee"] = insuranceFee.String
		}
		if claimGuidelines.Valid {
			product["claim_guidelines"] = claimGuidelines.String
		}
		if formRules.Valid {
			product["form_rules"] = formRules.String
		}

		documents = append(documents, product)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting products: %v", err)
		} else {
			fmt.Printf("   ✅ %d products migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No products to migrate")
	}
}

func migrateInvoices(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("📋 Migrating invoices...")
	rows, err := mariadb.Query(`
		SELECT invoice_id, master_invoice_id, customer_id, product_id, user_id, form_id, 
		       insurance_package, insurance_start, insurance_end, insurance_amount, 
		       insurance_quantity, contract_type, status, created_at, updated_at
		FROM invoices
	`)
	if err != nil {
		log.Printf("⚠️  Error querying invoices: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("invoices")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var invoiceID, productID int
		var masterInvoiceID, customerID, userID, formID sql.NullInt64
		var insurancePackage, contractType, status sql.NullString
		var insuranceStart, insuranceEnd time.Time
		var insuranceAmount sql.NullFloat64
		var insuranceQuantity sql.NullInt64
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&invoiceID, &masterInvoiceID, &customerID, &productID, &userID, &formID,
			&insurancePackage, &insuranceStart, &insuranceEnd, &insuranceAmount, &insuranceQuantity,
			&contractType, &status, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning invoice: %v", err)
			continue
		}

		invoice := bson.M{
			"_id":             invoiceID,
			"product_id":      productID,
			"insurance_start": insuranceStart,
			"insurance_end":   insuranceEnd,
			"created_at":      createdAt,
			"updated_at":      updatedAt,
		}

		if masterInvoiceID.Valid {
			invoice["master_invoice_id"] = masterInvoiceID.Int64
		}
		if customerID.Valid {
			invoice["customer_id"] = customerID.Int64
		}
		if userID.Valid {
			invoice["user_id"] = userID.Int64
		}
		if formID.Valid {
			invoice["form_id"] = formID.Int64
		}
		if insurancePackage.Valid {
			invoice["insurance_package"] = insurancePackage.String
		}
		if insuranceAmount.Valid {
			invoice["insurance_amount"] = insuranceAmount.Float64
		}
		if insuranceQuantity.Valid {
			invoice["insurance_quantity"] = insuranceQuantity.Int64
		}
		if contractType.Valid {
			invoice["contract_type"] = contractType.String
		}
		if status.Valid {
			invoice["status"] = status.String
		}

		documents = append(documents, invoice)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting invoices: %v", err)
		} else {
			fmt.Printf("   ✅ %d invoices migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No invoices to migrate")
	}
}

func migrateParticipants(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("👤 Migrating participants...")
	rows, err := mariadb.Query(`
		SELECT participant_id, invoice_id, cmnd_img, full_name, gender, birth_date, 
		       identity_number, created_at, updated_at
		FROM participants
	`)
	if err != nil {
		log.Printf("⚠️  Error querying participants: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("participants")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var participantID, invoiceID int
		var cmndImg, fullName, gender, identityNumber sql.NullString
		var birthDate time.Time
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&participantID, &invoiceID, &cmndImg, &fullName, &gender, &birthDate,
			&identityNumber, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning participant: %v", err)
			continue
		}

		participant := bson.M{
			"_id":        participantID,
			"invoice_id": invoiceID,
			"birth_date": birthDate,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}

		if cmndImg.Valid {
			participant["cmnd_img"] = cmndImg.String
		}
		if fullName.Valid {
			participant["full_name"] = fullName.String
		}
		if gender.Valid {
			participant["gender"] = gender.String
		}
		if identityNumber.Valid {
			participant["identity_number"] = identityNumber.String
		}

		documents = append(documents, participant)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting participants: %v", err)
		} else {
			fmt.Printf("   ✅ %d participants migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No participants to migrate")
	}
}

func migrateTravelParticipants(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("✈️👤 Migrating travel participants...")
	rows, err := mariadb.Query(`
		SELECT participant_id, invoice_id, cmnd_img, full_name, gender, birth_date, 
		       identity_number, created_at, updated_at
		FROM travel_participants
	`)
	if err != nil {
		log.Printf("⚠️  Error querying travel participants: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("travel_participants")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var participantID, invoiceID int
		var cmndImg, fullName, gender, identityNumber sql.NullString
		var birthDate time.Time
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&participantID, &invoiceID, &cmndImg, &fullName, &gender, &birthDate,
			&identityNumber, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning travel participant: %v", err)
			continue
		}

		participant := bson.M{
			"_id":        participantID,
			"invoice_id": invoiceID,
			"birth_date": birthDate,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}

		if cmndImg.Valid {
			participant["cmnd_img"] = cmndImg.String
		}
		if fullName.Valid {
			participant["full_name"] = fullName.String
		}
		if gender.Valid {
			participant["gender"] = gender.String
		}
		if identityNumber.Valid {
			participant["identity_number"] = identityNumber.String
		}

		documents = append(documents, participant)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting travel participants: %v", err)
		} else {
			fmt.Printf("   ✅ %d travel participants migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No travel participants to migrate")
	}
}

func migrateInsuranceParticipantInfo(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("ℹ️  Migrating insurance participant info...")
	rows, err := mariadb.Query(`
		SELECT participant_id, form_id, customer_id, cmnd_img, full_name, birth_date, 
		       gender, identity_number, main_benefit, created_at, updated_at
		FROM insurance_participant_info
	`)
	if err != nil {
		log.Printf("⚠️  Error querying insurance participant info: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("insurance_participant_info")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var participantID int
		var formID, customerID sql.NullInt64
		var cmndImg, fullName, gender, identityNumber, mainBenefit sql.NullString
		var birthDate time.Time
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&participantID, &formID, &customerID, &cmndImg, &fullName, &birthDate,
			&gender, &identityNumber, &mainBenefit, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning insurance participant info: %v", err)
			continue
		}

		info := bson.M{
			"_id":        participantID,
			"birth_date": birthDate,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}

		if formID.Valid {
			info["form_id"] = formID.Int64
		}
		if customerID.Valid {
			info["customer_id"] = customerID.Int64
		}
		if cmndImg.Valid {
			info["cmnd_img"] = cmndImg.String
		}
		if fullName.Valid {
			info["full_name"] = fullName.String
		}
		if gender.Valid {
			info["gender"] = gender.String
		}
		if identityNumber.Valid {
			info["identity_number"] = identityNumber.String
		}
		if mainBenefit.Valid {
			info["main_benefit"] = mainBenefit.String
		}

		documents = append(documents, info)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting insurance participant info: %v", err)
		} else {
			fmt.Printf("   ✅ %d insurance participant info migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No insurance participant info to migrate")
	}
}

func migrateCarInsuranceForms(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("🚗 Migrating car insurance forms...")
	rows, err := mariadb.Query(`
		SELECT car_form_id, form_id, user_type, identity_number, usage_purpose, vehicle_type, 
		       seat_count, load_capacity, owner_name, registration_address, license_plate_status,
		       license_plate, chassis_number, engine_number, insurance_start, insurance_duration,
		       insurance_fee, insurance_amount, participant_count, created_at, updated_at
		FROM car_insurance_forms
	`)
	if err != nil {
		log.Printf("⚠️  Error querying car insurance forms: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("car_insurance_forms")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var carFormID int
		var formID, seatCount, insuranceDuration, participantCount sql.NullInt64
		var userType, identityNumber, usagePurpose, vehicleType, ownerName, registrationAddress,
			licensePlateStatus, licensePlate, chassisNumber, engineNumber sql.NullString
		var loadCapacity, insuranceFee, insuranceAmount sql.NullFloat64
		var insuranceStart time.Time
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&carFormID, &formID, &userType, &identityNumber, &usagePurpose, &vehicleType,
			&seatCount, &loadCapacity, &ownerName, &registrationAddress, &licensePlateStatus, &licensePlate,
			&chassisNumber, &engineNumber, &insuranceStart, &insuranceDuration, &insuranceFee, &insuranceAmount,
			&participantCount, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning car insurance form: %v", err)
			continue
		}

		form := bson.M{
			"_id":             carFormID,
			"insurance_start": insuranceStart,
			"created_at":      createdAt,
			"updated_at":      updatedAt,
		}

		if formID.Valid {
			form["form_id"] = formID.Int64
		}
		if userType.Valid {
			form["user_type"] = userType.String
		}
		if identityNumber.Valid {
			form["identity_number"] = identityNumber.String
		}
		if usagePurpose.Valid {
			form["usage_purpose"] = usagePurpose.String
		}
		if vehicleType.Valid {
			form["vehicle_type"] = vehicleType.String
		}
		if seatCount.Valid {
			form["seat_count"] = seatCount.Int64
		}
		if loadCapacity.Valid {
			form["load_capacity"] = loadCapacity.Float64
		}
		if ownerName.Valid {
			form["owner_name"] = ownerName.String
		}
		if registrationAddress.Valid {
			form["registration_address"] = registrationAddress.String
		}
		if licensePlateStatus.Valid {
			form["license_plate_status"] = licensePlateStatus.String
		}
		if licensePlate.Valid {
			form["license_plate"] = licensePlate.String
		}
		if chassisNumber.Valid {
			form["chassis_number"] = chassisNumber.String
		}
		if engineNumber.Valid {
			form["engine_number"] = engineNumber.String
		}
		if insuranceDuration.Valid {
			form["insurance_duration"] = insuranceDuration.Int64
		}
		if insuranceFee.Valid {
			form["insurance_fee"] = insuranceFee.Float64
		}
		if insuranceAmount.Valid {
			form["insurance_amount"] = insuranceAmount.Float64
		}
		if participantCount.Valid {
			form["participant_count"] = participantCount.Int64
		}

		documents = append(documents, form)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting car insurance forms: %v", err)
		} else {
			fmt.Printf("   ✅ %d car insurance forms migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No car insurance forms to migrate")
	}
}

func migrateMotorbikeInsuranceForms(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("🏍️ Migrating motorbike insurance forms...")
	rows, err := mariadb.Query(`
		SELECT motorbike_form_id, form_id, engine_capacity, owner_name,
		       registration_address, license_plate_status, license_plate, chassis_number, 
		       engine_number, insurance_start, insurance_duration, insurance_fee,
		       created_at, updated_at
		FROM motorbike_insurance_forms
	`)
	if err != nil {
		log.Printf("⚠️  Error querying motorbike insurance forms: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("motorbike_insurance_forms")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var motorbikeFormID int
		var formID, insuranceDuration sql.NullInt64
		var ownerName, registrationAddress, licensePlateStatus, licensePlate,
			chassisNumber, engineNumber sql.NullString
		var engineCapacity, insuranceFee sql.NullFloat64
		var insuranceStart time.Time
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&motorbikeFormID, &formID, &engineCapacity, &ownerName,
			&registrationAddress, &licensePlateStatus, &licensePlate, &chassisNumber, &engineNumber,
			&insuranceStart, &insuranceDuration, &insuranceFee,
			&createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning motorbike insurance form: %v", err)
			continue
		}

		form := bson.M{
			"_id":             motorbikeFormID,
			"insurance_start": insuranceStart,
			"created_at":      createdAt,
			"updated_at":      updatedAt,
		}

		if formID.Valid {
			form["form_id"] = formID.Int64
		}
		if engineCapacity.Valid {
			form["engine_capacity"] = engineCapacity.Float64
		}
		if ownerName.Valid {
			form["owner_name"] = ownerName.String
		}
		if registrationAddress.Valid {
			form["registration_address"] = registrationAddress.String
		}
		if licensePlateStatus.Valid {
			form["license_plate_status"] = licensePlateStatus.String
		}
		if licensePlate.Valid {
			form["license_plate"] = licensePlate.String
		}
		if chassisNumber.Valid {
			form["chassis_number"] = chassisNumber.String
		}
		if engineNumber.Valid {
			form["engine_number"] = engineNumber.String
		}
		if insuranceDuration.Valid {
			form["insurance_duration"] = insuranceDuration.Int64
		}
		if insuranceFee.Valid {
			form["insurance_fee"] = insuranceFee.Float64
		}

		documents = append(documents, form)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting motorbike insurance forms: %v", err)
		} else {
			fmt.Printf("   ✅ %d motorbike insurance forms migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No motorbike insurance forms to migrate")
	}
}

func migrateCustomerRegistration(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("📝 Migrating customer registration...")
	rows, err := mariadb.Query(`
		SELECT customer_id, full_name, phone_number, email, identity_number, 
		       address, created_at, updated_at
		FROM customer_registration
	`)
	if err != nil {
		log.Printf("⚠️  Error querying customer registration: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("customer_registration")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var customerID int
		var fullName, phoneNumber, email, identityNumber, address sql.NullString
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&customerID, &fullName, &phoneNumber, &email, &identityNumber, &address,
			&createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning customer registration: %v", err)
			continue
		}

		registration := bson.M{
			"_id":        customerID,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}

		if fullName.Valid {
			registration["full_name"] = fullName.String
		}
		if phoneNumber.Valid {
			registration["phone_number"] = phoneNumber.String
		}
		if email.Valid {
			registration["email"] = email.String
		}
		if identityNumber.Valid {
			registration["identity_number"] = identityNumber.String
		}
		if address.Valid {
			registration["address"] = address.String
		}

		documents = append(documents, registration)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting customer registration: %v", err)
		} else {
			fmt.Printf("   ✅ %d customer registrations migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No customer registration to migrate")
	}
}

func migrateCategories(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("📂 Migrating categories...")
	rows, err := mariadb.Query(`
		SELECT category_id, name, image, created_at, updated_at
		FROM categories
	`)
	if err != nil {
		log.Printf("⚠️  Error querying categories: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("categories")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var categoryID int
		var name, image sql.NullString
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&categoryID, &name, &image, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning category: %v", err)
			continue
		}

		category := bson.M{
			"_id":        categoryID,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}

		if name.Valid {
			category["name"] = name.String
		}
		if image.Valid {
			category["image"] = image.String
		}

		documents = append(documents, category)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting categories: %v", err)
		} else {
			fmt.Printf("   ✅ %d categories migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No categories to migrate")
	}
}

func migratePosts(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("📄 Migrating posts...")
	rows, err := mariadb.Query(`
		SELECT post_id, title, content, author, image, created_at, updated_at
		FROM posts
	`)
	if err != nil {
		log.Printf("⚠️  Error querying posts: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("posts")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var postID int
		var title, content, author, image sql.NullString
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&postID, &title, &content, &author, &image, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning post: %v", err)
			continue
		}

		post := bson.M{
			"_id":        postID,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}

		if title.Valid {
			post["title"] = title.String
		}
		if content.Valid {
			post["content"] = content.String
		}
		if author.Valid {
			post["author"] = author.String
		}
		if image.Valid {
			post["image"] = image.String
		}

		documents = append(documents, post)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting posts: %v", err)
		} else {
			fmt.Printf("   ✅ %d posts migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No posts to migrate")
	}
}

func migrateHomeInsuranceInvoices(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("🏠 Migrating home insurance invoices...")
	rows, err := mariadb.Query(`
		SELECT invoice_id, user_id, form_id, customer_id, master_invoice_id, coverage_scope, 
		       home_type, home_usage_status, home_insurance_amount, asset_insurance_amount,
		       insured_person_name, insured_home_address, insurance_duration, insurance_start, 
		       insurance_end, total_amount, status, product_id, created_at, updated_at
		FROM home_insurance_invoices
	`)
	if err != nil {
		log.Printf("⚠️  Error querying home insurance invoices: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("home_insurance_invoices")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var invoiceID int
		var userID, formID, customerID, masterInvoiceID, insuranceDuration, productID sql.NullInt64
		var coverageScope, homeType, homeUsageStatus, insuredPersonName, insuredHomeAddress, status sql.NullString
		var homeInsuranceAmount, assetInsuranceAmount, totalAmount sql.NullFloat64
		var insuranceStart, insuranceEnd time.Time
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&invoiceID, &userID, &formID, &customerID, &masterInvoiceID, &coverageScope,
			&homeType, &homeUsageStatus, &homeInsuranceAmount, &assetInsuranceAmount, &insuredPersonName,
			&insuredHomeAddress, &insuranceDuration, &insuranceStart, &insuranceEnd, &totalAmount, &status,
			&productID, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning home insurance invoice: %v", err)
			continue
		}

		invoice := bson.M{
			"_id":             invoiceID,
			"insurance_start": insuranceStart,
			"insurance_end":   insuranceEnd,
			"created_at":      createdAt,
			"updated_at":      updatedAt,
		}

		if userID.Valid {
			invoice["user_id"] = userID.Int64
		}
		if formID.Valid {
			invoice["form_id"] = formID.Int64
		}
		if customerID.Valid {
			invoice["customer_id"] = customerID.Int64
		}
		if masterInvoiceID.Valid {
			invoice["master_invoice_id"] = masterInvoiceID.Int64
		}
		if coverageScope.Valid {
			invoice["coverage_scope"] = coverageScope.String
		}
		if homeType.Valid {
			invoice["home_type"] = homeType.String
		}
		if homeUsageStatus.Valid {
			invoice["home_usage_status"] = homeUsageStatus.String
		}
		if homeInsuranceAmount.Valid {
			invoice["home_insurance_amount"] = homeInsuranceAmount.Float64
		}
		if assetInsuranceAmount.Valid {
			invoice["asset_insurance_amount"] = assetInsuranceAmount.Float64
		}
		if insuredPersonName.Valid {
			invoice["insured_person_name"] = insuredPersonName.String
		}
		if insuredHomeAddress.Valid {
			invoice["insured_home_address"] = insuredHomeAddress.String
		}
		if insuranceDuration.Valid {
			invoice["insurance_duration"] = insuranceDuration.Int64
		}
		if totalAmount.Valid {
			invoice["total_amount"] = totalAmount.Float64
		}
		if status.Valid {
			invoice["status"] = status.String
		}
		if productID.Valid {
			invoice["product_id"] = productID.Int64
		}

		documents = append(documents, invoice)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting home insurance invoices: %v", err)
		} else {
			fmt.Printf("   ✅ %d home insurance invoices migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No home insurance invoices to migrate")
	}
}

func migrateInsuranceForms(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("📝 Migrating insurance forms...")
	rows, err := mariadb.Query(`
		SELECT form_id, customer_id, insurance_type, policy_holder_name, insurance_start, 
		       insurance_duration, total_premium, created_at
		FROM insurance_forms
	`)
	if err != nil {
		log.Printf("⚠️  Error querying insurance forms: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("insurance_forms")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var formID int
		var customerID sql.NullInt64
		var insuranceType, policyHolderName sql.NullString
		var insuranceDuration sql.NullInt64
		var totalPremium sql.NullFloat64
		var insuranceStart, createdAt time.Time

		if err := rows.Scan(&formID, &customerID, &insuranceType, &policyHolderName,
			&insuranceStart, &insuranceDuration, &totalPremium, &createdAt); err != nil {
			log.Printf("⚠️  Error scanning insurance form: %v", err)
			continue
		}

		form := bson.M{
			"_id":             formID,
			"insurance_start": insuranceStart,
			"created_at":      createdAt,
			"updated_at":      createdAt,
		}

		if customerID.Valid {
			form["customer_id"] = customerID.Int64
		}
		if insuranceType.Valid {
			form["insurance_type"] = insuranceType.String
		}
		if policyHolderName.Valid {
			form["policy_holder_name"] = policyHolderName.String
		}
		if insuranceDuration.Valid {
			form["insurance_duration"] = insuranceDuration.Int64
		}
		if totalPremium.Valid {
			form["total_premium"] = totalPremium.Float64
		}

		documents = append(documents, form)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting insurance forms: %v", err)
		} else {
			fmt.Printf("   ✅ %d insurance forms migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No insurance forms to migrate")
	}
}

func migrateInsuranceVehicleInfo(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("🚗 Migrating insurance vehicle info...")
	rows, err := mariadb.Query(`
		SELECT form_insurance_id, form_id, purpose, vehicle_type, brand, model, manufacture_year,
		       seat_count, vehicle_value, insurance_amount, registration_date, deductible, 
		       coverage_area, participant_count, participant_insurance_amount, created_at, updated_at
		FROM insurance_vehicle_info
	`)
	if err != nil {
		log.Printf("⚠️  Error querying insurance vehicle info: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("insurance_vehicle_info")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var formInsuranceID int
		var formID sql.NullInt64
		var purpose, vehicleType, brand, model, coverageArea sql.NullString
		var manufactureYear, seatCount, participantCount sql.NullInt64
		var vehicleValue, insuranceAmount, deductible, participantInsuranceAmount sql.NullFloat64
		var registrationDate sql.NullTime
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&formInsuranceID, &formID, &purpose, &vehicleType, &brand, &model,
			&manufactureYear, &seatCount, &vehicleValue, &insuranceAmount, &registrationDate,
			&deductible, &coverageArea, &participantCount, &participantInsuranceAmount,
			&createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning insurance vehicle info: %v", err)
			continue
		}

		info := bson.M{
			"_id":        formInsuranceID,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}

		if formID.Valid {
			info["form_id"] = formID.Int64
		}
		if purpose.Valid {
			info["purpose"] = purpose.String
		}
		if vehicleType.Valid {
			info["vehicle_type"] = vehicleType.String
		}
		if brand.Valid {
			info["brand"] = brand.String
		}
		if model.Valid {
			info["model"] = model.String
		}
		if manufactureYear.Valid {
			info["manufacture_year"] = manufactureYear.Int64
		}
		if seatCount.Valid {
			info["seat_count"] = seatCount.Int64
		}
		if vehicleValue.Valid {
			info["vehicle_value"] = vehicleValue.Float64
		}
		if insuranceAmount.Valid {
			info["insurance_amount"] = insuranceAmount.Float64
		}
		if registrationDate.Valid {
			info["registration_date"] = registrationDate.Time
		}
		if deductible.Valid {
			info["deductible"] = deductible.Float64
		}
		if coverageArea.Valid {
			info["coverage_area"] = coverageArea.String
		}
		if participantCount.Valid {
			info["participant_count"] = participantCount.Int64
		}
		if participantInsuranceAmount.Valid {
			info["participant_insurance_amount"] = participantInsuranceAmount.Float64
		}

		documents = append(documents, info)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting insurance vehicle info: %v", err)
		} else {
			fmt.Printf("   ✅ %d insurance vehicle info migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No insurance vehicle info to migrate")
	}
}

func migrateInvoicesMaster(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("📋 Migrating invoices master...")
	rows, err := mariadb.Query(`
		SELECT master_invoice_id, total_amount, status, created_at, updated_at
		FROM invoices_master
	`)
	if err != nil {
		log.Printf("⚠️  Error querying invoices master: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("invoices_master")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var masterInvoiceID int
		var totalAmount sql.NullFloat64
		var status sql.NullString
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&masterInvoiceID, &totalAmount, &status, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning invoices master: %v", err)
			continue
		}

		invoice := bson.M{
			"_id":        masterInvoiceID,
			"created_at": createdAt,
			"updated_at": updatedAt,
		}

		if totalAmount.Valid {
			invoice["total_amount"] = totalAmount.Float64
		}
		if status.Valid {
			invoice["status"] = status.String
		}

		documents = append(documents, invoice)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting invoices master: %v", err)
		} else {
			fmt.Printf("   ✅ %d invoices master migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No invoices master to migrate")
	}
}

func migratePaymentTransactions(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("💳 Migrating payment transactions...")
	rows, err := mariadb.Query(`
		SELECT id, invoice_id, txn_ref, transaction_no, amount, bank_code, 
		       response_code, status, created_at, updated_at
		FROM payment_transactions
	`)
	if err != nil {
		log.Printf("⚠️  Error querying payment transactions: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("payment_transactions")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var paymentID int
		var invoiceID sql.NullInt64
		var txnRef, transactionNo, bankCode, responseCode, status sql.NullString
		var amount sql.NullFloat64
		var createdAt time.Time
		var updatedAt sql.NullTime

		if err := rows.Scan(&paymentID, &invoiceID, &txnRef, &transactionNo, &amount,
			&bankCode, &responseCode, &status, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning payment transaction: %v", err)
			continue
		}

		transaction := bson.M{
			"_id":        paymentID,
			"created_at": createdAt,
		}

		if updatedAt.Valid {
			transaction["updated_at"] = updatedAt.Time
		} else {
			transaction["updated_at"] = createdAt
		}

		if invoiceID.Valid {
			transaction["invoice_id"] = invoiceID.Int64
		}
		if txnRef.Valid {
			transaction["txn_ref"] = txnRef.String
		}
		if transactionNo.Valid {
			transaction["transaction_no"] = transactionNo.String
		}
		if bankCode.Valid {
			transaction["bank_code"] = bankCode.String
		}
		if responseCode.Valid {
			transaction["response_code"] = responseCode.String
		}
		if amount.Valid {
			transaction["amount"] = amount.Float64
		}
		if status.Valid {
			transaction["status"] = status.String
		}

		documents = append(documents, transaction)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting payment transactions: %v", err)
		} else {
			fmt.Printf("   ✅ %d payment transactions migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No payment transactions to migrate")
	}
}

func migratePersonalInsuranceForms(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("🧑 Migrating personal insurance forms...")
	rows, err := mariadb.Query(`
		SELECT personal_form_id, form_id, full_name, cmnd_img, identity_number, birth_date, 
		       gender, insurance_program, dental_extension, maternity_extension, 
		       insurance_start, insurance_duration, insurance_fee, created_at, updated_at
		FROM personal_insurance_forms
	`)
	if err != nil {
		log.Printf("⚠️  Error querying personal insurance forms: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("personal_insurance_forms")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var personalFormID int
		var formID sql.NullInt64
		var fullName, cmndImg, identityNumber, gender, insuranceProgram sql.NullString
		var dentalExtension, maternityExtension sql.NullBool
		var insuranceDuration sql.NullInt64
		var insuranceFee sql.NullFloat64
		var birthDate, insuranceStart time.Time
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&personalFormID, &formID, &fullName, &cmndImg, &identityNumber,
			&birthDate, &gender, &insuranceProgram, &dentalExtension, &maternityExtension,
			&insuranceStart, &insuranceDuration, &insuranceFee, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning personal insurance form: %v", err)
			continue
		}

		form := bson.M{
			"_id":             personalFormID,
			"birth_date":      birthDate,
			"insurance_start": insuranceStart,
			"created_at":      createdAt,
			"updated_at":      updatedAt,
		}

		if formID.Valid {
			form["form_id"] = formID.Int64
		}
		if fullName.Valid {
			form["full_name"] = fullName.String
		}
		if cmndImg.Valid {
			form["cmnd_img"] = cmndImg.String
		}
		if identityNumber.Valid {
			form["identity_number"] = identityNumber.String
		}
		if gender.Valid {
			form["gender"] = gender.String
		}
		if insuranceProgram.Valid {
			form["insurance_program"] = insuranceProgram.String
		}
		if dentalExtension.Valid {
			form["dental_extension"] = dentalExtension.Bool
		}
		if maternityExtension.Valid {
			form["maternity_extension"] = maternityExtension.Bool
		}
		if insuranceDuration.Valid {
			form["insurance_duration"] = insuranceDuration.Int64
		}
		if insuranceFee.Valid {
			form["insurance_fee"] = insuranceFee.Float64
		}

		documents = append(documents, form)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting personal insurance forms: %v", err)
		} else {
			fmt.Printf("   ✅ %d personal insurance forms migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No personal insurance forms to migrate")
	}
}

func migrateTravelInsuranceInvoices(mariadb *sql.DB, mongoDB *mongo.Database) {
	fmt.Println("✈️ Migrating travel insurance invoices...")
	rows, err := mariadb.Query(`
		SELECT invoice_id, user_id, form_id, departure_location, destination,
		       departure_date, return_date, total_duration, group_size, insurance_program,
		       total_amount, status, created_at, updated_at
		FROM travel_insurance_invoices
	`)
	if err != nil {
		log.Printf("⚠️  Error querying travel insurance invoices: %v", err)
		return
	}
	defer rows.Close()

	collection := mongoDB.Collection("travel_insurance_invoices")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var documents []interface{}
	count := 0

	for rows.Next() {
		var invoiceID int
		var userID, formID, totalDuration, groupSize sql.NullInt64
		var departureLocation, destination, insuranceProgram, status sql.NullString
		var departureDate, returnDate time.Time
		var totalAmount sql.NullFloat64
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&invoiceID, &userID, &formID, &departureLocation, &destination,
			&departureDate, &returnDate, &totalDuration, &groupSize, &insuranceProgram,
			&totalAmount, &status, &createdAt, &updatedAt); err != nil {
			log.Printf("⚠️  Error scanning travel insurance invoice: %v", err)
			continue
		}

		invoice := bson.M{
			"_id":            invoiceID,
			"departure_date": departureDate,
			"return_date":    returnDate,
			"created_at":     createdAt,
			"updated_at":     updatedAt,
		}

		if userID.Valid {
			invoice["user_id"] = userID.Int64
		}
		if formID.Valid {
			invoice["form_id"] = formID.Int64
		}
		if departureLocation.Valid {
			invoice["departure_location"] = departureLocation.String
		}
		if destination.Valid {
			invoice["destination"] = destination.String
		}
		if totalDuration.Valid {
			invoice["total_duration"] = totalDuration.Int64
		}
		if groupSize.Valid {
			invoice["group_size"] = groupSize.Int64
		}
		if insuranceProgram.Valid {
			invoice["insurance_program"] = insuranceProgram.String
		}
		if totalAmount.Valid {
			invoice["total_amount"] = totalAmount.Float64
		}
		if status.Valid {
			invoice["status"] = status.String
		}

		documents = append(documents, invoice)
		count++
	}

	if len(documents) > 0 {
		_, err := collection.InsertMany(ctx, documents)
		if err != nil {
			log.Printf("❌ Error inserting travel insurance invoices: %v", err)
		} else {
			fmt.Printf("   ✅ %d travel insurance invoices migrated\n", count)
		}
	} else {
		fmt.Println("   ℹ️  No travel insurance invoices to migrate")
	}
}
