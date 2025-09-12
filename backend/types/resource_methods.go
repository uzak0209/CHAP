package types

import (
	"time"

	"github.com/google/uuid"
)

// ResourceEntity インターフェースの実装

// Post のメソッド実装
func (p *Post) GetID() uint              { return p.ID }
func (p *Post) SetUserID(id uuid.UUID)   { p.UserID = id }
func (p *Post) SetUsername(name string)  { p.Username = name }
func (p *Post) SetUpdatedAt(t time.Time) { p.UpdatedAt = t }
func (p *Post) GetTableName() string     { return "posts" }
func (p *Post) GetResourceName() string  { return "post" }

// Thread のメソッド実装
func (t *Thread) GetID() uint                 { return t.ID }
func (t *Thread) SetUserID(id uuid.UUID)      { t.UserID = id }
func (t *Thread) SetUsername(name string)     { t.Username = name }
func (t *Thread) SetUpdatedAt(time time.Time) { t.UpdatedAt = time }
func (t *Thread) GetTableName() string        { return "threads" }
func (t *Thread) GetResourceName() string     { return "thread" }

// Event のメソッド実装
func (e *Event) GetID() uint              { return e.ID }
func (e *Event) SetUserID(id uuid.UUID)   { e.UserID = id }
func (e *Event) SetUsername(name string)  { e.Username = name }
func (e *Event) SetUpdatedAt(t time.Time) { e.UpdatedAt = t }
func (e *Event) GetTableName() string     { return "events" }
func (e *Event) GetResourceName() string  { return "event" }
