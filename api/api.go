package api

import (
	DB "api/db"
	"api/types"
	"fmt"
	"log"
)

const AROUND = 0.01 // 近傍検索の範囲

func Search_userid(UserID int) (types.User, error) {
	var user types.User
	result := DB.GetDB().First(&user, UserID)
	if result.Error != nil {
		log.Println(result.Error)
		return types.User{}, result.Error
	}
	return user, nil
}

func Search_around(lat float64, lng float64, typ types.ObjectType) ([]types.MapObject, error) {
	var tableName string
	switch typ {
	case types.MESSAGE:
		tableName = "posts"
	case types.THREAD:
		tableName = "threads"
	case types.EVENT:
		tableName = "events"
	default:
		return nil, fmt.Errorf("invalid type: %s", typ)
	}

	var objs []types.MapObject
	result := DB.GetDB().Table(tableName).
		Where("lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?", lat-AROUND, lat+AROUND, lng-AROUND, lng+AROUND).
		Find(&objs)

	if result.Error != nil {
		log.Println(result.Error)
		return nil, result.Error
	}
	return objs, nil
}

func InsertDB(obj types.MapObject) error {
	result := DB.GetDB().Table("posts").Create(&obj)
	if result.Error != nil {
		log.Println(result.Error)
		return result.Error
	}
	return nil
}
