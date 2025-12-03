package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Kết nối MongoDB (MongoDB Atlas)
	mongoURI := "mongodb+srv://zzdragon14:long0910@cluster0.wj2zgu0.mongodb.net/"
	fmt.Println("🔌 Connecting to MongoDB Atlas...")
	fmt.Println("URI: mongodb+srv://zzdragon14:***@cluster0.wj2zgu0.mongodb.net/")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("❌ Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(ctx)

	// Ping MongoDB
	if err = client.Ping(ctx, nil); err != nil {
		log.Fatal("❌ Failed to ping MongoDB:", err)
	}

	fmt.Println("✅ Connected to MongoDB successfully!")
	fmt.Println("🗑️  Starting cleanup of int ID invoices...")
	fmt.Println()

	db := client.Database("bic_insurance")

	// Collections cần xử lý
	collections := []string{
		"invoices",
		"travel_insurance_invoices",
		"home_insurance_invoices",
		"accident_invoices",
	}

	totalDeleted := 0

	// Step 1: Xóa các invoice con có master_invoice_id là int
	fmt.Println("Step 1: Cleaning up child invoices with int master_invoice_id...")
	for _, collName := range collections {
		coll := db.Collection(collName)

		// Tìm các invoice có master_invoice_id là int
		filter := bson.M{
			"master_invoice_id": bson.M{
				"$type": bson.A{"int", "long", "double"},
			},
		}

		count, err := coll.CountDocuments(ctx, filter)
		if err != nil {
			fmt.Printf("  ⚠️  Error counting %s: %v\n", collName, err)
			continue
		}

		if count > 0 {
			fmt.Printf("  → Found %d documents in %s with int master_invoice_id\n", count, collName)

			result, err := coll.DeleteMany(ctx, filter)
			if err != nil {
				fmt.Printf("  ❌ Error deleting from %s: %v\n", collName, err)
				continue
			}

			fmt.Printf("  ✅ Deleted %d documents from %s\n", result.DeletedCount, collName)
			totalDeleted += int(result.DeletedCount)
		} else {
			fmt.Printf("  ℹ️  No documents with int master_invoice_id in %s\n", collName)
		}
	}

	// Step 2: Xóa các invoice con có _id là int (không phải ObjectID)
	fmt.Println("\nStep 2: Cleaning up child invoices with int _id...")
	for _, collName := range collections {
		coll := db.Collection(collName)

		// Tìm các invoice có _id là int
		filter := bson.M{
			"_id": bson.M{
				"$type": bson.A{"int", "long", "double"},
			},
		}

		count, err := coll.CountDocuments(ctx, filter)
		if err != nil {
			fmt.Printf("  ⚠️  Error counting %s: %v\n", collName, err)
			continue
		}

		if count > 0 {
			fmt.Printf("  → Found %d documents in %s with int _id\n", count, collName)

			result, err := coll.DeleteMany(ctx, filter)
			if err != nil {
				fmt.Printf("  ❌ Error deleting from %s: %v\n", collName, err)
				continue
			}

			fmt.Printf("  ✅ Deleted %d documents from %s\n", result.DeletedCount, collName)
			totalDeleted += int(result.DeletedCount)
		} else {
			fmt.Printf("  ℹ️  No documents with int _id in %s\n", collName)
		}
	}

	// Step 3: Xóa các master invoice có _id là int
	fmt.Println("\nStep 3: Cleaning up master invoices with int _id...")
	masterColl := db.Collection("invoices_master")

	filter := bson.M{
		"_id": bson.M{
			"$type": bson.A{"int", "long", "double"},
		},
	}

	count, err := masterColl.CountDocuments(ctx, filter)
	if err != nil {
		fmt.Printf("  ⚠️  Error counting invoices_master: %v\n", err)
	} else if count > 0 {
		fmt.Printf("  → Found %d master invoices with int _id\n", count)

		result, err := masterColl.DeleteMany(ctx, filter)
		if err != nil {
			fmt.Printf("  ❌ Error deleting from invoices_master: %v\n", err)
		} else {
			fmt.Printf("  ✅ Deleted %d master invoices\n", result.DeletedCount)
			totalDeleted += int(result.DeletedCount)
		}
	} else {
		fmt.Println("  ℹ️  No master invoices with int _id")
	}

	// Step 4: Xóa các invoice con có master_invoice_id null hoặc không tồn tại trong invoices_master
	fmt.Println("\nStep 4: Cleaning up orphaned child invoices...")
	for _, collName := range collections {
		coll := db.Collection(collName)

		// Tìm tất cả master_invoice_id còn lại
		cursor, err := coll.Find(ctx, bson.M{"master_invoice_id": bson.M{"$exists": true, "$ne": nil}})
		if err != nil {
			fmt.Printf("  ⚠️  Error querying %s: %v\n", collName, err)
			continue
		}

		var orphanedCount int64 = 0
		var orphanedIDs []primitive.ObjectID

		for cursor.Next(ctx) {
			var doc bson.M
			if err := cursor.Decode(&doc); err != nil {
				continue
			}

			// Kiểm tra master_invoice_id
			masterID, ok := doc["master_invoice_id"]
			if !ok {
				continue
			}

			// Nếu master_invoice_id là ObjectID, kiểm tra xem có tồn tại không
			if objID, ok := masterID.(primitive.ObjectID); ok {
				var masterDoc bson.M
				err := masterColl.FindOne(ctx, bson.M{"_id": objID}).Decode(&masterDoc)
				if err == mongo.ErrNoDocuments {
					// Master không tồn tại, đánh dấu để xóa
					if docID, ok := doc["_id"].(primitive.ObjectID); ok {
						orphanedIDs = append(orphanedIDs, docID)
						orphanedCount++
					}
				}
			}
		}
		cursor.Close(ctx)

		if orphanedCount > 0 {
			fmt.Printf("  → Found %d orphaned documents in %s\n", orphanedCount, collName)

			result, err := coll.DeleteMany(ctx, bson.M{"_id": bson.M{"$in": orphanedIDs}})
			if err != nil {
				fmt.Printf("  ❌ Error deleting orphaned from %s: %v\n", collName, err)
			} else {
				fmt.Printf("  ✅ Deleted %d orphaned documents from %s\n", result.DeletedCount, collName)
				totalDeleted += int(result.DeletedCount)
			}
		} else {
			fmt.Printf("  ℹ️  No orphaned documents in %s\n", collName)
		}
	}

	fmt.Println("\n============================================================")
	fmt.Printf("🎉 Cleanup completed! Total deleted: %d documents\n", totalDeleted)
	fmt.Println("============================================================")
}
