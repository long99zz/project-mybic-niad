package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func HashDemo() {
	password := "123456"
	
	// Tạo hash mới
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	
	fmt.Printf("Password: %s\n", password)
	fmt.Printf("Hash: %s\n", string(hash))
	
	// Test verify
	err = bcrypt.CompareHashAndPassword(hash, []byte(password))
	if err != nil {
		fmt.Printf("Verify failed: %v\n", err)
	} else {
		fmt.Printf("Verify successful!\n")
	}
} 