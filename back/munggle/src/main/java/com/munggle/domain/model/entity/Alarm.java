package com.munggle.domain.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "alarms")
public class Alarm {

    @Id
    @Column(name = "alarm_id")
    private Long id;

    private String alarmType;

    private Long fromUserId;

    private Long toUserId;

    private Long targetId;

    private LocalDateTime createdAt;

    private Boolean isDeleted;

    private Boolean isChecked;

}
