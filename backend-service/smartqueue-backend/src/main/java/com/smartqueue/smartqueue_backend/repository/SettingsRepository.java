package com.smartqueue.smartqueue_backend.repository;

import com.smartqueue.smartqueue_backend.entity.HospitalSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<HospitalSettings, Long> {
}